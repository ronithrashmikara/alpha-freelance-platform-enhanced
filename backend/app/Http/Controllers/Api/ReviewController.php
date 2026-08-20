<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Display a listing of reviews.
     */
    public function index(Request $request)
    {
        $query = Review::with(['project', 'reviewer', 'reviewee']);

        // Filter by reviewee (user being reviewed)
        if ($request->has('user_id')) {
            $query->where('reviewed_user_id', $request->user_id);
        }

        // Filter by project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Filter by rating
        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($reviews);
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'reviewed_user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:20',
            'skills_rating' => 'nullable|integer|min:1|max:5',
            'communication_rating' => 'nullable|integer|min:1|max:5',
            'timeliness_rating' => 'nullable|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::find($request->project_id);
        
        // Check if project is completed
        if ($project->status !== 'completed') {
            return response()->json([
                'message' => 'Can only review completed projects'
            ], 400);
        }

        // Check if user is involved in the project
        if ($project->user_id !== $request->user()->id && $project->assigned_to !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not involved in this project'
            ], 403);
        }

        // Check if user is not reviewing themselves
        if ($request->reviewed_user_id === $request->user()->id) {
            return response()->json([
                'message' => 'Cannot review yourself'
            ], 400);
        }

        // Check if review already exists
        $existingReview = Review::where('project_id', $project->id)
            ->where('reviewer_id', $request->user()->id)
            ->where('reviewed_user_id', $request->reviewed_user_id)
            ->first();
            
        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this user for this project'
            ], 400);
        }

        $review = Review::create([
            'project_id' => $request->project_id,
            'reviewer_id' => $request->user()->id,
            'reviewed_user_id' => $request->reviewed_user_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'skills_rating' => $request->skills_rating,
            'communication_rating' => $request->communication_rating,
            'timeliness_rating' => $request->timeliness_rating,
        ]);

        return response()->json([
            'message' => 'Review created successfully',
            'review' => $review->load(['project', 'reviewer', 'reviewee'])
        ], 201);
    }

    /**
     * Display the specified review.
     */
    public function show(Review $review)
    {
        return response()->json([
            'review' => $review->load(['project', 'reviewer', 'reviewee'])
        ]);
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, Review $review)
    {
        // Check if user owns the review
        if ($review->reviewer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if review is not too old (e.g., within 30 days)
        if ($review->created_at->diffInDays(now()) > 30) {
            return response()->json([
                'message' => 'Cannot edit reviews older than 30 days'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'sometimes|required|string|min:20',
            'skills_rating' => 'nullable|integer|min:1|max:5',
            'communication_rating' => 'nullable|integer|min:1|max:5',
            'timeliness_rating' => 'nullable|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update($request->only([
            'rating', 'comment', 'skills_rating', 
            'communication_rating', 'timeliness_rating'
        ]));

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->load(['project', 'reviewer', 'reviewee'])
        ]);
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Request $request, Review $review)
    {
        // Check if user owns the review or is admin
        if ($review->reviewer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if review is not too old (e.g., within 7 days for regular users)
        if ($request->user()->role !== 'admin' && $review->created_at->diffInDays(now()) > 7) {
            return response()->json([
                'message' => 'Cannot delete reviews older than 7 days'
            ], 400);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Get user's review statistics.
     */
    public function userStats(Request $request, $userId)
    {
        $stats = [
            'total_reviews' => Review::where('reviewed_user_id', $userId)->count(),
            'average_rating' => Review::where('reviewed_user_id', $userId)->avg('rating'),
            'rating_breakdown' => Review::where('reviewed_user_id', $userId)
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->orderBy('rating', 'desc')
                ->pluck('count', 'rating'),
            'skills_average' => Review::where('reviewed_user_id', $userId)
                ->whereNotNull('skills_rating')
                ->avg('skills_rating'),
            'communication_average' => Review::where('reviewed_user_id', $userId)
                ->whereNotNull('communication_rating')
                ->avg('communication_rating'),
            'timeliness_average' => Review::where('reviewed_user_id', $userId)
                ->whereNotNull('timeliness_rating')
                ->avg('timeliness_rating'),
            'recent_reviews' => Review::where('reviewed_user_id', $userId)
                ->with(['project', 'reviewer'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get reviews for a specific project.
     */
    public function projectReviews(Project $project)
    {
        $reviews = $project->reviews()
            ->with(['reviewer', 'reviewee'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'reviews' => $reviews
        ]);
    }
}