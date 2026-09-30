<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

class BidTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    public function test_a_provider_can_bid_on_an_open_project(): void
    {
        $client = $this->makeUser('consumer');
        $project = $this->makeProject($client, ['budget' => 1000]);
        $provider = $this->makeUser('provider');

        $this->actingWithToken($provider)
            ->postJson("/api/projects/{$project->id}/bids", [
                'amount' => 900,
                'proposal' => self::PROPOSAL,
                'delivery_time' => 10,
            ])
            ->assertCreated()
            ->assertJsonPath('auto_accepted', false)
            ->assertJsonPath('bid.user_id', $provider->id);

        $this->assertDatabaseHas('bids', ['project_id' => $project->id, 'user_id' => $provider->id, 'status' => 'pending']);
        $this->assertSame('open', $project->fresh()->status);
    }

    public function test_bid_placement_rules(): void
    {
        $client = $this->makeUser('consumer');
        $project = $this->makeProject($client, ['budget' => 1000]);
        $provider = $this->makeUser('provider');
        $valid = ['amount' => 900, 'proposal' => self::PROPOSAL, 'delivery_time' => 10];

        // Not on your own project.
        $this->actingWithToken($client)->postJson("/api/projects/{$project->id}/bids", $valid)->assertStatus(400);

        // Over budget, a short proposal and an impossible delivery time are rejected.
        $this->actingWithToken($provider)
            ->postJson("/api/projects/{$project->id}/bids", ['amount' => 1500, 'proposal' => 'too short', 'delivery_time' => 0])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['amount', 'proposal', 'delivery_time']);

        // One bid per provider per project.
        $this->actingWithToken($provider)->postJson("/api/projects/{$project->id}/bids", $valid)->assertCreated();
        $this->actingWithToken($provider)->postJson("/api/projects/{$project->id}/bids", $valid)->assertStatus(400);

        // Closed projects take no bids.
        $closed = $this->makeProject($client, ['status' => 'completed']);
        $this->actingWithToken($provider)->postJson("/api/projects/{$closed->id}/bids", $valid)->assertStatus(400);

        $this->assertDatabaseCount('bids', 1);
    }

    public function test_a_bid_at_or_below_80_percent_of_budget_is_accepted_automatically(): void
    {
        $client = $this->makeUser('consumer');
        $project = $this->makeProject($client, ['budget' => 1000]);
        $earlier = $this->makeBid($project, $this->makeUser('provider'), ['amount' => 950]);
        $cheap = $this->makeUser('provider');

        $this->actingWithToken($cheap)
            ->postJson("/api/projects/{$project->id}/bids", ['amount' => 800, 'proposal' => self::PROPOSAL, 'delivery_time' => 7])
            ->assertCreated()
            ->assertJsonPath('auto_accepted', true);

        $project->refresh();
        $this->assertSame('in_progress', $project->status);
        $this->assertSame($cheap->id, (int) $project->assigned_to);
        $this->assertSame('rejected', $earlier->fresh()->status);
    }

    public function test_only_the_project_owner_can_accept_and_acceptance_rejects_the_other_bids(): void
    {
        $client = $this->makeUser('consumer');
        $project = $this->makeProject($client);
        $winner = $this->makeBid($project, $this->makeUser('provider'), ['amount' => 900]);
        $loser = $this->makeBid($project, $this->makeUser('provider'), ['amount' => 950]);

        $this->actingWithToken($this->makeUser('consumer'))->postJson("/api/bids/{$winner->id}/accept")->assertForbidden();
        $this->actingWithToken($winner->user)->postJson("/api/bids/{$winner->id}/accept")->assertForbidden();

        $this->actingWithToken($client)->postJson("/api/bids/{$winner->id}/accept")->assertOk();

        $this->assertSame('accepted', $winner->fresh()->status);
        $this->assertSame('rejected', $loser->fresh()->status);
        $this->assertSame('in_progress', $project->fresh()->status);
        $this->assertSame($winner->user_id, (int) $project->fresh()->assigned_to);

        // The project is no longer open, so nothing else can be accepted.
        $this->actingWithToken($client)->postJson("/api/bids/{$loser->id}/accept")->assertStatus(400);
    }

    public function test_a_provider_can_withdraw_only_their_own_pending_bid(): void
    {
        $client = $this->makeUser('consumer');
        $project = $this->makeProject($client);
        $provider = $this->makeUser('provider');
        $bid = $this->makeBid($project, $provider);

        $this->actingWithToken($this->makeUser('provider'))->deleteJson("/api/bids/{$bid->id}")->assertForbidden();
        $this->actingWithToken($client)->deleteJson("/api/bids/{$bid->id}")->assertForbidden();

        $this->actingWithToken($provider)->deleteJson("/api/bids/{$bid->id}")->assertOk();
        $this->assertDatabaseMissing('bids', ['id' => $bid->id]);

        // An accepted bid can no longer be withdrawn.
        $accepted = $this->makeBid($this->makeProject($client), $provider, ['status' => 'accepted']);
        $this->actingWithToken($provider)->deleteJson("/api/bids/{$accepted->id}")->assertStatus(400);
        $this->assertDatabaseHas('bids', ['id' => $accepted->id]);
    }
}
