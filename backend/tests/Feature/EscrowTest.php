<?php

namespace Tests\Feature;

use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

/**
 * The simulated escrow: a ledger of wallet balances and Payment rows, with no
 * payment provider. An escrow Payment moves held -> completed (released to the
 * freelancer once the project is completed); see PaymentController.
 */
class EscrowTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    public function test_escrow_is_funded_from_the_client_wallet_and_released_to_the_freelancer_after_completion(): void
    {
        [$client, $freelancer, $project] = $this->assignedProject(clientBalance: 2000, bidAmount: 900);

        // Fund: the accepted bid amount leaves the client's wallet and is held.
        $paymentId = $this->actingWithToken($client)
            ->postJson("/api/projects/{$project->id}/escrow")
            ->assertCreated()
            ->assertJsonPath('payment.type', 'escrow')
            ->assertJsonPath('payment.status', 'held')
            ->json('payment.id');

        $this->assertSame(1100.0, $this->balanceOf($client));
        $this->assertSame(0.0, $this->balanceOf($freelancer));

        // Release is refused while the work is not marked complete.
        $this->actingWithToken($client)->postJson("/api/payments/{$paymentId}/release")->assertStatus(400);

        // Only the assigned freelancer can mark the project complete.
        $this->actingWithToken($client)->postJson("/api/projects/{$project->id}/complete")->assertForbidden();
        $this->actingWithToken($freelancer)->postJson("/api/projects/{$project->id}/complete")->assertOk();
        $this->assertSame('completed', $project->fresh()->status);

        // Only the payer can release.
        $this->actingWithToken($freelancer)->postJson("/api/payments/{$paymentId}/release")->assertForbidden();

        $this->actingWithToken($client)
            ->postJson("/api/payments/{$paymentId}/release")
            ->assertOk()
            ->assertJsonPath('payment.status', 'completed');

        $payment = Payment::findOrFail($paymentId);
        $this->assertNotNull($payment->released_at);
        $this->assertSame(900.0, $this->balanceOf($freelancer));
        $this->assertSame(1100.0, $this->balanceOf($client));

        // A released payment cannot be released (or paid out) twice.
        $this->actingWithToken($client)->postJson("/api/payments/{$paymentId}/release")->assertStatus(400);
        $this->assertSame(900.0, $this->balanceOf($freelancer));
    }

    public function test_escrow_can_only_be_created_once_by_the_owner_of_an_assigned_project(): void
    {
        [$client, $freelancer, $project] = $this->assignedProject(clientBalance: 2000);

        $this->actingWithToken($freelancer)->postJson("/api/projects/{$project->id}/escrow")->assertForbidden();

        $unassigned = $this->makeProject($client);
        $this->actingWithToken($client)->postJson("/api/projects/{$unassigned->id}/escrow")->assertStatus(400);

        $this->actingWithToken($client)->postJson("/api/projects/{$project->id}/escrow")->assertCreated();
        $this->actingWithToken($client)->postJson("/api/projects/{$project->id}/escrow")->assertStatus(400);

        $this->assertSame(1, Payment::where('project_id', $project->id)->where('type', 'escrow')->count());
        $this->assertSame(1100.0, $this->balanceOf($client), 'charged exactly once');
    }

    public function test_escrow_is_refused_when_the_client_cannot_cover_the_accepted_bid(): void
    {
        [$client, , $project] = $this->assignedProject(clientBalance: 500, bidAmount: 900);

        $this->actingWithToken($client)
            ->postJson("/api/projects/{$project->id}/escrow")
            ->assertStatus(400)
            ->assertJsonPath('message', 'Insufficient wallet balance');

        $this->assertSame(500.0, $this->balanceOf($client));
        $this->assertSame(0, Payment::count());
    }
}
