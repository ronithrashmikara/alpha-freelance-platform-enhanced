<?php

namespace Tests\Support;

use App\Models\Bid;
use App\Models\Project;
use App\Models\User;
use App\Models\Wallet;

/**
 * Builds the people and records a marketplace test needs, and authenticates
 * requests the way the frontend does: a real Sanctum personal access token
 * sent as a Bearer header (the `api.auth` middleware looks it up itself).
 */
trait MarketplaceHelpers
{
    /** A long-enough proposal: the API requires at least 50 characters. */
    protected const PROPOSAL = 'I have shipped several projects like this one and can start straight away with a clear plan.';

    protected function makeUser(string $role = 'consumer', float $balance = 100): User
    {
        $user = User::factory()->create(['role' => $role]);
        Wallet::create([
            'user_id' => $user->id,
            'address' => '0x'.bin2hex(random_bytes(20)),
            'private_key' => bin2hex(random_bytes(32)),
            'balance_usdt' => $balance,
        ]);

        return $user->fresh();
    }

    /** Sends the following requests as $user, with a fresh Sanctum token. */
    protected function actingWithToken(User $user): static
    {
        // Guards cache the resolved user between requests in one test.
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('test')->plainTextToken);
    }

    protected function makeProject(User $owner, array $attributes = []): Project
    {
        return Project::factory()->create(array_merge(['user_id' => $owner->id, 'budget' => 1000], $attributes));
    }

    protected function makeBid(Project $project, User $bidder, array $attributes = []): Bid
    {
        return Bid::factory()->create(array_merge([
            'project_id' => $project->id,
            'user_id' => $bidder->id,
            'amount' => 900,
            'proposal' => self::PROPOSAL,
        ], $attributes));
    }

    /**
     * A project whose bid has been accepted: in progress and assigned to the
     * freelancer. Returns [client, freelancer, project, bid].
     */
    protected function assignedProject(float $clientBalance = 2000, float $bidAmount = 900): array
    {
        $client = $this->makeUser('consumer', $clientBalance);
        $freelancer = $this->makeUser('provider', 0);
        $project = $this->makeProject($client);
        $bid = $this->makeBid($project, $freelancer, ['amount' => $bidAmount]);

        $this->actingWithToken($client)->postJson("/api/bids/{$bid->id}/accept")->assertOk();

        return [$client, $freelancer, $project->fresh(), $bid->fresh()];
    }

    protected function balanceOf(User $user): float
    {
        return (float) Wallet::where('user_id', $user->id)->value('balance_usdt');
    }
}
