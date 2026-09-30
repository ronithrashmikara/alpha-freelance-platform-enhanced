<?php

namespace Tests\KnownBugs;

use App\Models\Dispute;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

/**
 * Bugs found while writing the test suite, each written as a test of the
 * CORRECT behaviour, so each one fails until the bug is fixed.
 *
 * These are deliberately outside the default test suites (phpunit.xml runs
 * tests/Unit and tests/Feature). CI runs them in a separate, non-blocking step
 * so the failures stay visible:
 *
 *   php artisan test tests/KnownBugs
 *
 * When a bug is fixed, move its test into tests/Feature.
 */
class KnownBugsTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    /** AuthController::register accepts role=admin from anyone (the UI only offers consumer/provider). */
    public function test_public_registration_cannot_create_an_admin(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Mallory',
            'email' => 'mallory@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'role' => 'admin',
        ])->assertStatus(422);
    }

    /**
     * /api/password/reset-request (public, email only) returns the verification
     * hash that /api/password/reset accepts, so anyone who knows an email
     * address can set that account's password.
     */
    public function test_an_anonymous_reset_request_does_not_return_the_reset_secret(): void
    {
        $victim = $this->makeUser();

        $this->postJson('/api/password/reset-request', ['email' => $victim->email])
            ->assertJsonMissingPath('verification_hash');
    }

    /**
     * PaymentController::requestRefund sets status "refund_requested", which the
     * payments.status enum (pending, held, completed, failed, refunded) does not
     * allow, so the refund path (held -> refund_requested -> refunded) cannot start.
     */
    public function test_a_client_can_request_a_refund_on_held_escrow(): void
    {
        [$client, , $project] = $this->assignedProject();
        $paymentId = $this->actingWithToken($client)->postJson("/api/projects/{$project->id}/escrow")->json('payment.id');

        $this->actingWithToken($client)
            ->postJson("/api/payments/{$paymentId}/refund", ['reason' => 'The freelancer stopped replying two weeks ago.'])
            ->assertOk();

        $this->assertSame('refund_requested', Payment::find($paymentId)->status);
    }

    /**
     * PaymentController::deposit writes type "deposit" (and withdraw writes
     * "withdrawal"), but the payments.type enum only allows escrow, direct, refund.
     */
    public function test_a_wallet_deposit_is_recorded(): void
    {
        $user = $this->makeUser('consumer', 0);

        $this->actingWithToken($user)
            ->postJson('/api/wallet/deposit', ['amount' => 50, 'payment_method' => 'crypto', 'transaction_hash' => '0xabc'])
            ->assertOk();

        $this->assertSame(50.0, $this->balanceOf($user));
    }

    /** The wallet page's "add funds" (WalletController::addFunds) also inserts type "deposit". */
    public function test_add_funds_from_the_wallet_page_is_recorded(): void
    {
        $user = $this->makeUser('consumer', 0);

        $this->actingWithToken($user)
            ->postJson('/api/wallet/add-funds', ['amount' => 50, 'payment_method' => 'credit_card'])
            ->assertOk();

        $this->assertSame(50.0, $this->balanceOf($user));
    }

    /**
     * AdminController::resolveDispute loads $dispute->raisedByUser / againstUser,
     * relations that do not exist on Dispute (it has complainant / respondent).
     */
    public function test_an_admin_can_resolve_a_dispute_through_the_admin_endpoint(): void
    {
        [$client, $freelancer, $project] = $this->assignedProject();
        $dispute = Dispute::create([
            'project_id' => $project->id,
            'complainant_id' => $client->id,
            'respondent_id' => $freelancer->id,
            'type' => 'quality',
            'description' => str_repeat('The delivered work does not match the brief. ', 2),
            'status' => 'open',
        ]);

        $this->actingWithToken($this->makeUser('admin'))
            ->postJson("/api/admin/disputes/{$dispute->id}/resolve", ['resolution' => 'Split', 'winner' => 'raised_by'])
            ->assertOk();
    }

    /** GET /api/disputes/statistics is registered after /api/disputes/{dispute}, which captures it. */
    public function test_dispute_statistics_route_is_reachable(): void
    {
        $this->actingWithToken($this->makeUser('admin'))
            ->getJson('/api/disputes/statistics')
            ->assertOk()
            ->assertJsonStructure(['total', 'open', 'in_review', 'resolved', 'closed']);
    }
}
