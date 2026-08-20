<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class ProjectBreakdownController extends Controller
{

    /**
     * Generate project breakdown using Mistral AI
     */
    public function generateBreakdown(Request $request, Project $project)
    {
        // Check if user owns the project, is assigned to it, or is an admin
        $user = $request->user();
        if ($project->user_id !== $user->id && $project->assigned_to !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $mistralApiKey = env('MISTRAL_API_KEY');
            if (!$mistralApiKey) {
                return response()->json(['message' => 'Mistral API key not configured'], 500);
            }

            // Prepare the prompt for Mistral
            $prompt = $this->buildMistralPrompt($project);

            // Call Mistral API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $mistralApiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.mistral.ai/v1/chat/completions', [
                'model' => 'mistral-large-latest',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a project management expert specializing in breaking down complex projects into manageable tasks and milestones.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 2000,
                'temperature' => 0.7
            ]);

            if ($response->successful()) {
                $breakdown = $response->json()['choices'][0]['message']['content'];
                
                // Store the breakdown in the project
                $project->update([
                    'ai_breakdown' => $breakdown,
                    'breakdown_generated_at' => now()
                ]);

                return response()->json([
                    'message' => 'Project breakdown generated successfully',
                    'breakdown' => $breakdown,
                    'project' => $project->fresh()
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to generate breakdown',
                    'error' => $response->body()
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating breakdown: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Research project requirements using Tavily
     */
    public function researchProject(Request $request, Project $project)
    {
        // Check if user owns the project, is assigned to it, or is an admin
        $user = $request->user();
        if ($project->user_id !== $user->id && $project->assigned_to !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'research_query' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $tavilyApiKey = env('TAVILY_API_KEY');
            if (!$tavilyApiKey) {
                return response()->json(['message' => 'Tavily API key not configured'], 500);
            }

            // Build research query
            $query = $request->research_query ?? $this->buildTavilyQuery($project);

            // Call Tavily API
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post('https://api.tavily.com/search', [
                'api_key' => $tavilyApiKey,
                'query' => $query,
                'search_depth' => 'advanced',
                'include_answer' => true,
                'include_images' => false,
                'include_raw_content' => false,
                'max_results' => 10
            ]);

            if ($response->successful()) {
                $searchResults = $response->json();
                
                // Store research results
                $project->update([
                    'research_data' => $searchResults,
                    'research_query' => $query,
                    'research_generated_at' => now()
                ]);

                return response()->json([
                    'message' => 'Project research completed successfully',
                    'research' => $searchResults,
                    'query' => $query,
                    'project' => $project->fresh()
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to complete research',
                    'error' => $response->body()
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error conducting research: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get comprehensive project analysis combining Mistral and Tavily
     */
    public function getComprehensiveAnalysis(Request $request, Project $project)
    {
        // Check if user owns the project, is assigned to it, or is an admin
        $user = $request->user();
        if ($project->user_id !== $user->id && $project->assigned_to !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Generate breakdown if not exists
            if (!$project->ai_breakdown) {
                $this->generateBreakdown($request, $project);
                $project = $project->fresh();
            }

            // Conduct research if not exists
            if (!$project->research_data) {
                $this->researchProject($request, $project);
                $project = $project->fresh();
            }

            // Combine results with additional analysis
            $analysis = [
                'project_overview' => [
                    'title' => $project->title,
                    'description' => $project->description,
                    'budget' => $project->budget,
                    'category' => $project->category,
                    'skills_required' => $project->skills_required,
                    'status' => $project->status
                ],
                'ai_breakdown' => $project->ai_breakdown,
                'research_insights' => $project->research_data,
                'recommendations' => $this->generateRecommendations($project),
                'risk_assessment' => $this->assessProjectRisks($project),
                'timeline_estimate' => $this->estimateTimeline($project),
                'generated_at' => now()
            ];

            return response()->json([
                'message' => 'Comprehensive analysis completed',
                'analysis' => $analysis
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating comprehensive analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Build prompt for Mistral AI
     */
    private function buildMistralPrompt(Project $project)
    {
        return "Please provide a detailed project breakdown for the following project:

Title: {$project->title}
Description: {$project->description}
Budget: \${$project->budget}
Category: {$project->category}
Skills Required: " . implode(', ', $project->skills_required ?? []) . "

Please provide:
1. Task breakdown structure with specific deliverables
2. Milestone definitions with clear acceptance criteria
3. Resource requirements and skill dependencies
4. Risk identification and mitigation strategies
5. Quality assurance checkpoints
6. Estimated timeline for each phase
7. Communication and reporting structure

Format the response in a clear, structured manner that can be easily understood by both clients and freelancers.";
    }

    /**
     * Build query for Tavily research
     */
    private function buildTavilyQuery(Project $project)
    {
        $skills = is_array($project->skills_required) ? implode(' ', $project->skills_required) : '';
        return "{$project->category} {$skills} best practices trends 2024 project requirements";
    }

    /**
     * Generate project recommendations
     */
    private function generateRecommendations(Project $project)
    {
        $recommendations = [];

        // Budget recommendations
        if ($project->budget < 1000) {
            $recommendations[] = "Consider increasing budget for better quality outcomes";
        }

        // Skill recommendations
        if (empty($project->skills_required)) {
            $recommendations[] = "Define specific skills required for better freelancer matching";
        }

        // Timeline recommendations
        $recommendations[] = "Set clear milestones and deadlines for better project management";
        $recommendations[] = "Regular communication checkpoints recommended";

        return $recommendations;
    }

    /**
     * Assess project risks
     */
    private function assessProjectRisks(Project $project)
    {
        $risks = [];

        if ($project->budget < 500) {
            $risks[] = ['level' => 'high', 'description' => 'Low budget may affect quality'];
        }

        if (empty($project->skills_required)) {
            $risks[] = ['level' => 'medium', 'description' => 'Unclear skill requirements'];
        }

        if (strlen($project->description) < 100) {
            $risks[] = ['level' => 'medium', 'description' => 'Insufficient project description'];
        }

        return $risks;
    }

    /**
     * Estimate project timeline
     */
    private function estimateTimeline(Project $project)
    {
        $baseHours = 40; // Base estimation
        
        // Adjust based on budget
        $budgetMultiplier = min($project->budget / 1000, 3);
        $estimatedHours = $baseHours * $budgetMultiplier;
        
        // Adjust based on complexity (skills required)
        $skillsCount = count($project->skills_required ?? []);
        $complexityMultiplier = 1 + ($skillsCount * 0.2);
        $estimatedHours *= $complexityMultiplier;

        return [
            'estimated_hours' => round($estimatedHours),
            'estimated_days' => round($estimatedHours / 8),
            'estimated_weeks' => round($estimatedHours / 40),
            'factors_considered' => [
                'budget_level' => $project->budget,
                'complexity_score' => $skillsCount,
                'category' => $project->category
            ]
        ];
    }
}