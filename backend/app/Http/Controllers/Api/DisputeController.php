<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DisputeController extends Controller
{
    /**
     * Display a listing of disputes.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Dispute::with(['project', 'complainant', 'respondent']);

        // Admin can see all disputes
        if ($user->role === 'admin') {
            $disputes = $query->orderBy('created_at', 'desc')->paginate(20);
        } else {
            // Users can only see their own disputes
            $disputes = $query->where(function($q) use ($user) {
                $q->where('complainant_id', $user->id)
                  ->orWhere('respondent_id', $user->id);
            })->orderBy('created_at', 'desc')->paginate(20);
        }

        return response()->json($disputes);
    }

    /**
     * Store a newly created dispute.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'respondent_id' => 'required|exists:users,id',
            'type' => 'required|in:quality,payment,communication,deadline,other',
            'description' => 'required|string|min:50',
            'evidence' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::find($request->project_id);
        
        // Check if user is involved in the project
        if ($project->user_id !== $request->user()->id && $project->assigned_to !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not involved in this project'
            ], 403);
        }

        // Check if dispute already exists for this project
        $existingDispute = Dispute::where('project_id', $project->id)
            ->whereIn('status', ['open', 'in_review'])
            ->first();
            
        if ($existingDispute) {
            return response()->json([
                'message' => 'An active dispute already exists for this project'
            ], 400);
        }

        $dispute = Dispute::create([
            'project_id' => $request->project_id,
            'complainant_id' => $request->user()->id,
            'respondent_id' => $request->respondent_id,
            'type' => $request->type,
            'description' => $request->description,
            'evidence' => $request->evidence,
            'status' => 'open',
        ]);

        return response()->json([
            'message' => 'Dispute created successfully',
            'dispute' => $dispute->load(['project', 'complainant', 'respondent'])
        ], 201);
    }

    /**
     * Display the specified dispute.
     */
    public function show(Request $request, Dispute $dispute)
    {
        $user = $request->user();
        
        // Check if user is involved in the dispute or is admin
        if ($dispute->complainant_id !== $user->id && 
            $dispute->respondent_id !== $user->id && 
            $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'dispute' => $dispute->load(['project', 'complainant', 'respondent', 'messages.user'])
        ]);
    }

    /**
     * Update the specified dispute (admin only).
     */
    public function update(Request $request, Dispute $dispute)
    {
        // Only admin can update dispute status
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|in:open,in_review,resolved,closed',
            'resolution' => 'required_if:status,resolved|string',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['status', 'resolution', 'admin_notes']);
        
        if ($request->status === 'resolved') {
            $updateData['resolved_at'] = now();
            $updateData['resolved_by'] = $request->user()->id;
        }

        $dispute->update($updateData);

        return response()->json([
            'message' => 'Dispute updated successfully',
            'dispute' => $dispute->load(['project', 'complainant', 'respondent'])
        ]);
    }

    /**
     * Add a message to the dispute.
     */
    public function addMessage(Request $request, Dispute $dispute)
    {
        $user = $request->user();
        
        // Check if user is involved in the dispute or is admin
        if ($dispute->complainant_id !== $user->id && 
            $dispute->respondent_id !== $user->id && 
            $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|min:10',
            'attachments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create message (assuming we have a dispute_messages table)
        $message = $dispute->messages()->create([
            'user_id' => $user->id,
            'message' => $request->message,
            'attachments' => $request->attachments,
        ]);

        // Update dispute status if it was closed
        if ($dispute->status === 'closed') {
            $dispute->update(['status' => 'open']);
        }

        return response()->json([
            'message' => 'Message added successfully',
            'dispute_message' => $message->load('user')
        ], 201);
    }

    /**
     * Close dispute (parties can close if resolved).
     */
    public function close(Request $request, Dispute $dispute)
    {
        $user = $request->user();
        
        // Check if user is involved in the dispute
        if ($dispute->complainant_id !== $user->id && $dispute->respondent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Can only close if resolved or if both parties agree
        if ($dispute->status !== 'resolved') {
            return response()->json([
                'message' => 'Dispute must be resolved before closing'
            ], 400);
        }

        $dispute->update(['status' => 'closed']);

        return response()->json([
            'message' => 'Dispute closed successfully',
            'dispute' => $dispute->load(['project', 'complainant', 'respondent'])
        ]);
    }

    /**
     * Get dispute statistics (admin only).
     */
    public function statistics(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $stats = [
            'total' => Dispute::count(),
            'open' => Dispute::where('status', 'open')->count(),
            'in_review' => Dispute::where('status', 'in_review')->count(),
            'resolved' => Dispute::where('status', 'resolved')->count(),
            'closed' => Dispute::where('status', 'closed')->count(),
            'by_type' => Dispute::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'recent' => Dispute::with(['project', 'complainant', 'respondent'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }
}