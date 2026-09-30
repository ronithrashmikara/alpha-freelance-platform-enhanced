<?php

namespace Tests\Feature;

use App\Models\Dispute;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

/** Dispute lifecycle: open -> in_review -> resolved (admin) -> closed (a party). */
class DisputeTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    private function openDispute($complainant, $respondent, $project)
    {
        return $this->actingWithToken($complainant)->postJson('/api/disputes', [
            'project_id' => $project->id,
            'respondent_id' => $respondent->id,
            'type' => 'quality',
            'description' => 'The delivered site is missing the checkout page that the brief listed as required.',
        ]);
    }

    public function test_only_a_party_to_the_project_can_open_one_active_dispute(): void
    {
        [$client, $freelancer, $project] = $this->assignedProject();

        $this->openDispute($this->makeUser('provider'), $client, $project)->assertForbidden();

        $this->openDispute($client, $freelancer, $project)
            ->assertCreated()
            ->assertJsonPath('dispute.status', 'open')
            ->assertJsonPath('dispute.complainant_id', $client->id);

        // One active dispute per project, whichever side raises it.
        $this->openDispute($freelancer, $client, $project)->assertStatus(400);

        $this->actingWithToken($client)
            ->postJson('/api/disputes', ['project_id' => $project->id, 'respondent_id' => $freelancer->id, 'type' => 'bribery', 'description' => 'short'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['type', 'description']);

        $this->assertSame(1, Dispute::count());
    }

    public function test_dispute_is_messaged_resolved_by_an_admin_and_closed_by_a_party(): void
    {
        [$client, $freelancer, $project] = $this->assignedProject();
        $admin = $this->makeUser('admin');
        $outsider = $this->makeUser('consumer');
        $disputeId = $this->openDispute($client, $freelancer, $project)->json('dispute.id');

        // Parties and admins can post messages; nobody else can read or post.
        $this->actingWithToken($freelancer)
            ->postJson("/api/disputes/{$disputeId}/messages", ['message' => 'The checkout page is on the staging branch.'])
            ->assertCreated();
        $this->actingWithToken($outsider)
            ->postJson("/api/disputes/{$disputeId}/messages", ['message' => 'Let me in on this one please.'])
            ->assertForbidden();
        $this->actingWithToken($outsider)->getJson("/api/disputes/{$disputeId}")->assertForbidden();

        // A party cannot close an unresolved dispute.
        $this->actingWithToken($client)->postJson("/api/disputes/{$disputeId}/close")->assertStatus(400);

        // Admin moves it to review, then resolves it with a written resolution.
        $this->actingWithToken($admin)->putJson("/api/disputes/{$disputeId}", ['status' => 'in_review'])->assertOk();
        $this->actingWithToken($admin)->putJson("/api/disputes/{$disputeId}", ['status' => 'resolved'])->assertStatus(422);
        $this->actingWithToken($admin)
            ->putJson("/api/disputes/{$disputeId}", ['status' => 'resolved', 'resolution' => 'Freelancer to merge the checkout page within 3 days.'])
            ->assertOk()
            ->assertJsonPath('dispute.status', 'resolved');

        $dispute = Dispute::findOrFail($disputeId);
        $this->assertSame($admin->id, (int) $dispute->resolved_by);
        $this->assertNotNull($dispute->resolved_at);

        $this->actingWithToken($freelancer)->postJson("/api/disputes/{$disputeId}/close")->assertOk();
        $this->assertSame('closed', $dispute->fresh()->status);

        $this->actingWithToken($client)
            ->getJson("/api/disputes/{$disputeId}")
            ->assertOk()
            ->assertJsonCount(1, 'dispute.messages');
    }
}
