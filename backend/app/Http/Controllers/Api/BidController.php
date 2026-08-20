<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bid;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BidController extends Controller
{
    /**
     * Display bids for a specific project.
     */
    public function index(Project $project)
    {
        $bids = $project->bids()->with('user')->orderBy('amount', 'asc')->get();
        
        return response()->json([
            'bids' => $bids
        ]);
    }

    /**
     * Store a newly created bid.
     */
    public function store(Request $request, Project $project)
    {
        // Check if project is still open
        if ($project->status !== 'open') {
            return response()->json([
                'message' => 'Project is not accepting bids'
            ], 400);
        }

        // Check if user is not the project owner
        if ($project->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'Cannot bid on your own project'
            ], 400);
        }

        // Check if user already has a bid on this project
        $existingBid = $project->bids()->where('user_id', $request->user()->id)->first();
        if ($existingBid) {
            return response()->json([
                'message' => 'You already have a bid on this project'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1|lte:' . $project->budget,
            'proposal' => 'required|string|min:50',
            'delivery_time' => 'required|integer|min:1|max:365',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $bid = Bid::create([
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'amount' => $request->amount,
            'proposal' => $request->proposal,
            'delivery_time' => $request->delivery_time,
        ]);

        // Auto-accept bid if amount is significantly lower than budget (80% or less)
        if ($request->amount <= ($project->budget * 0.8)) {
            // Accept this bid
            $bid->update(['status' => 'accepted']);
            
            // Reject all other bids
            $project->bids()->where('id', '!=', $bid->id)->update(['status' => 'rejected']);
            
            // Update project status
            $project->update([
                'status' => 'in_progress',
                'assigned_to' => $request->user()->id
            ]);

            return response()->json([
                'message' => 'Bid automatically accepted! Project assigned to you.',
                'bid' => $bid->load('user'),
                'project' => $project->load('user'),
                'auto_accepted' => true
            ], 201);
        }

        return response()->json([
            'message' => 'Bid submitted successfully',
            'bid' => $bid->load('user'),
            'auto_accepted' => false
        ], 201);
    }

    /**
     * Update the specified bid.
     */
    public function update(Request $request, Bid $bid)
    {
        // Check if user owns the bid
        if ($bid->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if bid is still pending
        if ($bid->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot update bid that is not pending'
            ], 400);
        }

        // Check if project is still open
        if ($bid->project->status !== 'open') {
            return response()->json([
                'message' => 'Project is not accepting bid updates'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|required|numeric|min:1|lte:' . $bid->project->budget,
            'proposal' => 'sometimes|required|string|min:50',
            'delivery_time' => 'sometimes|required|integer|min:1|max:365',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $bid->update($request->only(['amount', 'proposal', 'delivery_time']));

        return response()->json([
            'message' => 'Bid updated successfully',
            'bid' => $bid->load('user')
        ]);
    }

    /**
     * Accept a bid (project owner only).
     */
    public function accept(Request $request, Bid $bid)
    {
        // Check if user owns the project
        if ($bid->project->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if project is still open
        if ($bid->project->status !== 'open') {
            return response()->json([
                'message' => 'Project is not accepting bids'
            ], 400);
        }

        // Check if bid is pending
        if ($bid->status !== 'pending') {
            return response()->json([
                'message' => 'Bid is not available for acceptance'
            ], 400);
        }

        // Accept the bid and reject all others
        $bid->update(['status' => 'accepted']);
        $bid->project->bids()->where('id', '!=', $bid->id)->update(['status' => 'rejected']);
        
        // Update project status
        $bid->project->update([
            'status' => 'in_progress',
            'assigned_to' => $bid->user_id
        ]);

        return response()->json([
            'message' => 'Bid accepted successfully',
            'bid' => $bid->load('user'),
            'project' => $bid->project->load('user')
        ]);
    }

    /**
     * Remove the specified bid.
     */
    public function destroy(Request $request, Bid $bid)
    {
        // Check if user owns the bid
        if ($bid->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if bid is still pending
        if ($bid->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot delete bid that is not pending'
            ], 400);
        }

        $bid->delete();

        return response()->json([
            'message' => 'Bid deleted successfully'
        ]);
    }
}
