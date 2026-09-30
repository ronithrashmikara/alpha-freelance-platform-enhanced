<?php

namespace Tests\Feature;

use App\Notifications\PasswordResetCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    public function test_a_reset_request_emails_the_code_and_never_returns_it(): void
    {
        Notification::fake();
        $user = $this->makeUser();

        foreach (['/api/password/reset-request', '/api/password/regenerate-hash'] as $endpoint) {
            $this->postJson($endpoint, ['email' => $user->email])
                ->assertOk()
                ->assertJsonMissingPath('verification_hash')
                ->assertJsonMissingPath('expires_at');
        }

        $code = $user->fresh()->verification_hash;
        $this->assertNotNull($code);
        Notification::assertSentTo($user, PasswordResetCode::class, fn ($n) => $n->code === $code);
    }

    public function test_the_response_does_not_reveal_whether_an_account_exists(): void
    {
        Notification::fake();
        $user = $this->makeUser();

        $known = $this->postJson('/api/password/reset-request', ['email' => $user->email])->assertOk()->json();
        $unknown = $this->postJson('/api/password/reset-request', ['email' => 'nobody@example.com'])->assertOk()->json();

        $this->assertSame($known, $unknown);
        Notification::assertSentTimes(PasswordResetCode::class, 1);
    }

    public function test_the_emailed_code_resets_the_password_once_and_revokes_tokens(): void
    {
        Notification::fake();
        $user = $this->makeUser();
        $user->createToken('old-session');

        $this->postJson('/api/password/reset-request', ['email' => $user->email])->assertOk();
        $code = null;
        Notification::assertSentTo($user, PasswordResetCode::class, function ($n) use (&$code) {
            $code = $n->code;

            return true;
        });

        $reset = fn (string $hash) => $this->postJson('/api/password/reset', [
            'email' => $user->email,
            'verification_hash' => $hash,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ]);

        $reset('ZZZZZZZZ')->assertStatus(400);
        $reset($code)->assertOk();

        $this->assertTrue(Hash::check('brand-new-password', $user->fresh()->password));
        $this->assertSame(0, $user->tokens()->count());
        $reset($code)->assertStatus(400); // single use
    }
}
