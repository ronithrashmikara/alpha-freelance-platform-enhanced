<?php

namespace Tests\Feature;

use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

/** The simulated wallet: deposits, add-funds, withdrawals and history are ledger rows only. */
class WalletTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    public function test_a_crypto_deposit_is_recorded_and_credited(): void
    {
        $user = $this->makeUser('consumer', 0);

        $this->actingWithToken($user)
            ->postJson('/api/wallet/deposit', ['amount' => 50, 'payment_method' => 'crypto', 'transaction_hash' => '0xabc'])
            ->assertOk()
            ->assertJsonPath('payment.type', 'deposit')
            ->assertJsonPath('payment.status', 'completed');

        $this->assertSame(50.0, $this->balanceOf($user));
    }

    public function test_add_funds_from_the_wallet_page_is_recorded_and_credited(): void
    {
        $user = $this->makeUser('consumer', 0);

        $this->actingWithToken($user)
            ->postJson('/api/wallet/add-funds', ['amount' => 50, 'payment_method' => 'credit_card'])
            ->assertOk();

        $this->assertSame(50.0, $this->balanceOf($user));
        $this->assertDatabaseHas('payments', ['payee_id' => $user->id, 'type' => 'deposit', 'status' => 'completed']);
    }

    public function test_a_withdrawal_debits_the_wallet_and_cannot_exceed_the_balance(): void
    {
        $user = $this->makeUser('consumer', 100);

        $this->actingWithToken($user)
            ->postJson('/api/wallet/withdraw', ['amount' => 150, 'withdrawal_method' => 'bank_transfer', 'destination_address' => 'LK00 1234'])
            ->assertStatus(422);

        $this->actingWithToken($user)
            ->postJson('/api/wallet/withdraw', ['amount' => 30, 'withdrawal_method' => 'bank_transfer', 'destination_address' => 'LK00 1234'])
            ->assertOk()
            ->assertJsonPath('payment.type', 'withdrawal')
            ->assertJsonPath('payment.status', 'pending');

        $this->assertSame(70.0, $this->balanceOf($user));
    }

    public function test_transaction_history_labels_direction_from_the_users_side(): void
    {
        [$client, $freelancer, $project] = $this->assignedProject();
        $this->actingWithToken($client)->postJson("/api/projects/{$project->id}/escrow")->assertCreated();

        $this->actingWithToken($client)
            ->getJson('/api/wallet/transactions')
            ->assertOk()
            ->assertJsonPath('data.0.direction', 'outgoing')
            ->assertJsonPath('data.0.other_party_id', $freelancer->id);

        $this->actingWithToken($freelancer)
            ->getJson('/api/wallet/transactions')
            ->assertOk()
            ->assertJsonPath('data.0.direction', 'incoming');

        $this->assertSame(1, Payment::count());
    }
}
