<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Project::with(['user', 'bids.user']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category') && $request->get('category') !== 'All') {
            $query->where('category', $request->get('category'));
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if ($sortBy === 'budget') {
            $query->orderBy('budget', $sortOrder);
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        $projects = $query->paginate(12);

        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string|min:10',
                'category' => 'required|string|max:100',
                'skills' => 'required|array|min:1',
                'skills.*' => 'string|max:50',
                'budget' => 'required|numeric|min:1|max:1000000',
                'deadline' => 'nullable|date|after:today',
                'images' => 'nullable|array|max:5',
                'images.*' => 'string|url',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check user permissions
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'message' => 'Authentication required'
                ], 401);
            }

            // Create project with error handling
            $project = Project::create([
                'user_id' => $user->id,
                'title' => trim($request->title),
                'description' => trim($request->description),
                'category' => $request->category,
                'skills' => array_map('trim', $request->skills),
                'budget' => round($request->budget, 2),
                'deadline' => $request->deadline,
                'images' => $request->images ?? [],
                'status' => 'open',
            ]);

            // Update user's total projects count
            $user->increment('total_projects');

            // Load relationships safely
            $project->load(['user:id,name,email,avatar,rating']);

            return response()->json([
                'message' => 'Project created successfully',
                'project' => $project,
                'id' => $project->id
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error during project creation: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Database error occurred. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Database error'
            ], 500);
            
        } catch (\Exception $e) {
            \Log::error('Project creation failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to create project. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        return response()->json([
            'project' => $project->load(['user', 'bids.user', 'reviews.reviewer'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        // Check if user owns the project or is admin
        $user = $request->user();
        if ($project->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. You can only update your own projects.'
            ], 403);
        }

        // Prevent updates to completed or cancelled projects (unless admin)
        if (in_array($project->status, ['completed', 'cancelled']) && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Cannot update completed or cancelled projects'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string|min:10',
            'category' => 'sometimes|required|string|max:100',
            'skills' => 'sometimes|required|array|min:1',
            'skills.*' => 'string|max:50',
            'budget' => 'sometimes|required|numeric|min:1|max:1000000',
            'status' => 'sometimes|required|in:open,in_progress,completed,cancelled',
            'deadline' => 'nullable|date|after:today',
            'images' => 'nullable|array|max:5',
            'images.*' => 'string|url',
            'assigned_to' => 'sometimes|nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Prepare update data
        $updateData = [];
        
        if ($request->has('title')) {
            $updateData['title'] = trim($request->title);
        }
        if ($request->has('description')) {
            $updateData['description'] = trim($request->description);
        }
        if ($request->has('category')) {
            $updateData['category'] = $request->category;
        }
        if ($request->has('skills')) {
            $updateData['skills'] = array_map('trim', $request->skills);
        }
        if ($request->has('budget')) {
            $updateData['budget'] = round($request->budget, 2);
        }
        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }
        if ($request->has('deadline')) {
            $updateData['deadline'] = $request->deadline;
        }
        if ($request->has('images')) {
            $updateData['images'] = $request->images;
        }
        if ($request->has('assigned_to') && $user->role === 'admin') {
            $updateData['assigned_to'] = $request->assigned_to;
        }

        $project->update($updateData);

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->load(['user:id,name,email,avatar,rating', 'bids.user:id,name,rating'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Project $project)
    {
        // Check if user owns the project
        if ($project->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Only allow deletion if project is not in progress
        if ($project->status === 'in_progress') {
            return response()->json([
                'message' => 'Cannot delete project that is in progress'
            ], 400);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully'
        ]);
    }
}
