<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

/**
 * The admin dashboard, lists, stats and reports run hand-written SQL. CI runs
 * this on SQLite and PostgreSQL, which is what catches SQLite-only functions
 * (strftime, julianday) and double-quoted string literals.
 */
class AdminReportsTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    public function test_admin_dashboard_lists_stats_and_reports_work_on_this_database(): void
    {
        // Some data in every table the reports read.
        [$client, $freelancer, $project] = $this->assignedProject(clientBalance: 2000);
        $this->actingWithToken($client)->postJson("/api/projects/{$project->id}/escrow")->assertCreated();
        $this->actingWithToken($client)->postJson('/api/disputes', [
            'project_id' => $project->id,
            'respondent_id' => $freelancer->id,
            'type' => 'deadline',
            'description' => 'The first milestone is a week late and there has been no update since then.',
        ])->assertCreated();

        $admin = $this->makeUser('admin');

        $this->actingWithToken($admin)->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('total_projects', 1);
        $this->actingWithToken($admin)->getJson('/api/admin/payments')->assertOk()->assertJsonPath('data.0.payer.id', $client->id);
        $this->actingWithToken($admin)->getJson('/api/admin/disputes')->assertOk()->assertJsonPath('data.0.complainant.id', $client->id);
        $this->actingWithToken($admin)->getJson("/api/admin/projects/{$project->id}/details")->assertOk();

        $stats = $this->actingWithToken($admin)->getJson('/api/admin/stats')->assertOk();
        $this->assertSame(now()->format('Y-m'), $stats->json('payments_by_month.0.month'));

        $this->actingWithToken($admin)->getJson('/api/admin/reports/users')->assertOk();
        $this->actingWithToken($admin)->getJson('/api/admin/reports/projects')->assertOk()->assertJsonPath('summary.total_projects', 1);
        $this->actingWithToken($admin)->getJson('/api/admin/reports/financial')->assertOk()->assertJsonPath('summary.total_transactions', 1);
        $this->actingWithToken($admin)->getJson('/api/admin/reports/disputes')->assertOk()->assertJsonPath('summary.total_disputes', 1);
    }
}
