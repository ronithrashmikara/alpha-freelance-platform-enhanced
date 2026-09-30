<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    public function test_register_creates_a_user_with_a_welcome_wallet_and_a_working_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Nimal Perera',
            'email' => 'nimal@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'role' => 'provider',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'nimal@example.com')
            ->assertJsonPath('user.role', 'provider')
            ->assertJsonStructure(['token', 'verification_hash']);

        $user = User::where('email', 'nimal@example.com')->firstOrFail();
        $this->assertSame(20.0, $this->balanceOf($user), 'new wallets start with the 20 USDT welcome bonus');
        $this->assertNotSame('secret-password', $user->password, 'password is stored hashed');

        $this->withToken($response->json('token'))
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_register_validates_input(): void
    {
        $this->postJson('/api/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'different',
            'role' => 'superuser',
        ])->assertStatus(422)->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    public function test_login_issues_a_token_only_for_correct_credentials(): void
    {
        $user = $this->makeUser();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');

        // UserFactory's default password is "password".
        $token = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->json('token');

        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('user.email', $user->email);
    }

    public function test_protected_routes_reject_missing_or_unknown_tokens_and_logout_revokes_the_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
        $this->withToken('1|not-a-real-token')->getJson('/api/me')->assertUnauthorized();
        $this->postJson('/api/projects/1/bids', [])->assertUnauthorized();

        $user = $this->makeUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->app['auth']->forgetGuards();

        $this->withToken($token)->getJson('/api/me')->assertUnauthorized();
        $this->assertSame(0, $user->tokens()->count());
    }
}
