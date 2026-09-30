<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bid>
 */
class BidFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'amount' => 900,
            'proposal' => str_repeat('I will deliver this carefully and on time. ', 3),
            'delivery_time' => 14,
            'status' => 'pending',
        ];
    }
}
