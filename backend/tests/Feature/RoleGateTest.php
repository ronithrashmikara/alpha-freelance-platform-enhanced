<?php

namespace Tests\Feature;

use App\Models\Dispute;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceHelpers;
use Tests\TestCase;

class RoleGateTest extends TestCase
{
    use MarketplaceHelpers, RefreshDatabase;

    public function test_admin_routes_are_closed_to_consumers_and_providers(): void
    {
        foreach (['consumer', 'provider'] as $role) {
            $this->actingWithToken($this->makeUser($role))
                ->getJson('/api/admin/users')
                ->assertForbidden()
                ->assertJsonPath('message', 'Unauthorized. Admin access required.');
        }

        $this->actingWithToken($this->makeUser('admin'))
            ->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonStructure(['data', 'total']);
    }

    public function test_admin_only_actions_inside_shared_controllers_check_the_role(): void
    {
        [$client, $freelancer, $project] = $this->assignedProject();

        $payment = Payment::create([
            'project_id' => $project->id,
            'payer_id' => $client->id,
            'payee_id' => $freelancer->id,
            'amount' => 900,
            'type' => 'escrow',
            'status' => 'held',
        ]);
        $dispute = Dispute::create([
            'project_id' => $project->id,
            'complainant_id' => $client->id,
            'respondent_id' => $freelancer->id,
            'type' => 'quality',
            'description' => str_repeat('The delivered work does not match the brief. ', 2),
            'status' => 'open',
        ]);

        // A party to the payment or dispute is still not an admin.
        $this->actingWithToken($client)->postJson("/api/payments/{$payment->id}/process-refund")->assertForbidden();
        $this->actingWithToken($client)
            ->putJson("/api/disputes/{$dispute->id}", ['status' => 'resolved', 'resolution' => 'Client wins'])
            ->assertForbidden();

        $this->assertSame('open', $dispute->fresh()->status);
        $this->assertSame('held', $payment->fresh()->status);
    }
}
