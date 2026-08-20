<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SimpleProjectController extends Controller
{
    /**
     * Store a newly created project without caching dependencies
     */
    public function store(Request $request)
    {
        try {
            // Basic validation
            $rules = [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'category' => 'required|string',
                'skills' => 'required|array',
                'budget' => 'required|numeric|min:1',
                'deadline' => 'nullable|date|after:today',
            ];

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create project directly with DB query to avoid cache issues
            $projectId = DB::table('projects')->insertGetId([
                'user_id' => $request->user()->id,
                'title' => $request->title,
                'description' => $request->description,
                'category' => $request->category,
                'skills' => json_encode($request->skills),
                'budget' => $request->budget,
                'deadline' => $request->deadline,
                'images' => json_encode($request->images ?? []),
                'status' => 'open',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Get the created project
            $project = DB::table('projects')
                ->join('users', 'projects.user_id', '=', 'users.id')
                ->select(
                    'projects.*',
                    'users.name as user_name',
                    'users.email as user_email'
                )
                ->where('projects.id', $projectId)
                ->first();

            if ($project) {
                // Convert JSON strings back to arrays
                $project->skills = json_decode($project->skills, true);
                $project->images = json_decode($project->images, true);
            }

            return response()->json([
                'success' => true,
                'message' => 'Project created successfully',
                'project' => $project,
                'id' => $projectId
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create project',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all projects without caching
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('projects')
                ->join('users', 'projects.user_id', '=', 'users.id')
                ->select(
                    'projects.*',
                    'users.name as user_name',
                    'users.email as user_email'
                );

            // Search functionality
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function($q) use ($search) {
                    $q->where('projects.title', 'like', "%{$search}%")
                      ->orWhere('projects.description', 'like', "%{$search}%");
                });
            }

            // Category filter
            if ($request->has('category') && $request->get('category') !== 'All') {
                $query->where('projects.category', $request->get('category'));
            }

            // Status filter
            if ($request->has('status')) {
                $query->where('projects.status', $request->get('status'));
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            if ($sortBy === 'budget') {
                $query->orderBy('projects.budget', $sortOrder);
            } else {
                $query->orderBy('projects.created_at', $sortOrder);
            }

            $projects = $query->get();

            // Convert JSON strings back to arrays
            foreach ($projects as $project) {
                $project->skills = json_decode($project->skills, true) ?? [];
                $project->images = json_decode($project->images, true) ?? [];
            }

            return response()->json([
                'success' => true,
                'data' => $projects,
                'total' => count($projects)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch projects',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}