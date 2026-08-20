<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Project;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Bid;
use App\Models\Dispute;
use Maatwebsite\Excel\Facades\Excel;
use Dompdf\Dompdf;
use Dompdf\Options;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Exports\UserActivityExport;
use App\Exports\PaymentsExport;
use App\Exports\ProjectAnalyticsExport;
use App\Exports\PlatformStatsExport;

class ReportController extends Controller
{
    /**
     * Generate user activity report
     */
    public function userActivity(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();
        $userId = $request->user_id;

        // Get user activity data
        $query = User::with(['projects', 'bids', 'reviews', 'payments'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($userId) {
            $query->where('id', $userId);
        }

        $users = $query->get();

        $data = $users->map(function ($user) {
            return [
                'User ID' => $user->id,
                'Name' => $user->name,
                'Email' => $user->email,
                'Role' => $user->role,
                'Projects Created' => $user->projects->count(),
                'Bids Placed' => $user->bids->count(),
                'Reviews Given' => $user->reviews->count(),
                'Total Payments' => $user->payments->sum('amount'),
                'Rating' => $user->rating,
                'Status' => $user->status,
                'Joined Date' => $user->created_at->format('Y-m-d H:i:s')
            ];
        });

        if ($request->format === 'excel') {
            return Excel::download(new UserActivityExport($data), 'user_activity_report.xlsx');
        } else {
            return $this->generatePDF($data, 'User Activity Report', 'user_activity_report.pdf');
        }
    }

    /**
     * Generate payments report
     */
    public function payments(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:pending,completed,failed,held,released'
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();

        $query = Payment::with(['payer', 'payee', 'project'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $payments = $query->get();

        $data = $payments->map(function ($payment) {
            return [
                'Payment ID' => $payment->id,
                'Project' => $payment->project ? $payment->project->title : 'N/A',
                'Payer' => $payment->payer ? $payment->payer->name : 'N/A',
                'Payee' => $payment->payee ? $payment->payee->name : 'N/A',
                'Amount' => '$' . number_format($payment->amount, 2),
                'Type' => $payment->type,
                'Status' => $payment->status,
                'Payment Method' => $payment->payment_method ?? 'N/A',
                'Transaction Hash' => $payment->transaction_hash ?? 'N/A',
                'Created Date' => $payment->created_at->format('Y-m-d H:i:s')
            ];
        });

        if ($request->format === 'excel') {
            return Excel::download(new PaymentsExport($data), 'payments_report.xlsx');
        } else {
            return $this->generatePDF($data, 'Payments Report', 'payments_report.pdf');
        }
    }

    /**
     * Generate project analytics report
     */
    public function projectAnalytics(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:open,in_progress,completed,cancelled'
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();

        $query = Project::with(['user', 'bids', 'reviews'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $projects = $query->get();

        $data = $projects->map(function ($project) {
            return [
                'Project ID' => $project->id,
                'Title' => $project->title,
                'Category' => $project->category,
                'Budget' => '$' . number_format($project->budget, 2),
                'Status' => $project->status,
                'Client' => $project->user->name,
                'Bids Count' => $project->bids->count(),
                'Average Bid' => $project->bids->count() > 0 ? '$' . number_format($project->bids->avg('amount'), 2) : 'N/A',
                'Reviews Count' => $project->reviews->count(),
                'Average Rating' => $project->reviews->count() > 0 ? number_format($project->reviews->avg('rating'), 1) : 'N/A',
                'Created Date' => $project->created_at->format('Y-m-d H:i:s')
            ];
        });

        if ($request->format === 'excel') {
            return Excel::download(new ProjectAnalyticsExport($data), 'project_analytics_report.xlsx');
        } else {
            return $this->generatePDF($data, 'Project Analytics Report', 'project_analytics_report.pdf');
        }
    }

    /**
     * Generate platform statistics report
     */
    public function platformStats(Request $request)
    {
        $request->validate([
            'format' => 'required|in:pdf,excel',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();

        // Gather platform statistics
        $stats = [
            'Total Users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
            'Active Users' => User::where('status', 'active')->whereBetween('created_at', [$startDate, $endDate])->count(),
            'Total Projects' => Project::whereBetween('created_at', [$startDate, $endDate])->count(),
            'Completed Projects' => Project::where('status', 'completed')->whereBetween('created_at', [$startDate, $endDate])->count(),
            'Total Bids' => Bid::whereBetween('created_at', [$startDate, $endDate])->count(),
            'Accepted Bids' => Bid::where('status', 'accepted')->whereBetween('created_at', [$startDate, $endDate])->count(),
            'Total Payments' => '$' . number_format(Payment::whereBetween('created_at', [$startDate, $endDate])->sum('amount'), 2),
            'Completed Payments' => Payment::where('status', 'completed')->whereBetween('created_at', [$startDate, $endDate])->count(),
            'Total Reviews' => Review::whereBetween('created_at', [$startDate, $endDate])->count(),
            'Average Rating' => number_format(Review::whereBetween('created_at', [$startDate, $endDate])->avg('rating') ?? 0, 1),
            'Total Disputes' => Dispute::whereBetween('created_at', [$startDate, $endDate])->count(),
            'Open Disputes' => Dispute::where('status', 'open')->whereBetween('created_at', [$startDate, $endDate])->count(),
        ];

        $data = collect($stats)->map(function ($value, $key) {
            return [
                'Metric' => $key,
                'Value' => $value
            ];
        });

        if ($request->format === 'excel') {
            return Excel::download(new PlatformStatsExport($data), 'platform_stats_report.xlsx');
        } else {
            return $this->generatePDF($data, 'Platform Statistics Report', 'platform_stats_report.pdf');
        }
    }

    /**
     * Generate PDF report
     */
    private function generatePDF($data, $title, $filename)
    {
        $options = new Options();
        $options->set('defaultFont', 'Arial');
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);

        $html = view('reports.pdf_template', compact('data', 'title'))->render();
        
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        return response($dompdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
