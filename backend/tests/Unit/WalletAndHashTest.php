<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Wallet;
use Tests\TestCase;

/** Model helpers that need no database. */
class WalletAndHashTest extends TestCase
{
    public function test_wallet_affordability_and_total_include_the_escrow_balance(): void
    {
        $wallet = new Wallet(['balance_usdt' => 100, 'escrow_balance' => 40]);

        $this->assertTrue($wallet->canAfford(100));
        $this->assertFalse($wallet->canAfford(100.01));
        $this->assertEquals(140, $wallet->getTotalBalance());
    }

    public function test_password_reset_hash_expires_after_24_hours(): void
    {
        $user = new User;
        $this->assertFalse($user->isHashValid(), 'no hash generated yet');

        $user->hash_generated_at = now()->subHours(23);
        $this->assertTrue($user->isHashValid());

        $user->hash_generated_at = now()->subHours(25);
        $this->assertFalse($user->isHashValid());
    }
}
