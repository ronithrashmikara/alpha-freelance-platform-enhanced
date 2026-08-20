<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'address',
        'private_key',
        'balance_usdt',
        'balance_eth',
        'escrow_balance',
    ];

    protected function casts(): array
    {
        return [
            'balance_usdt' => 'decimal:2',
            'balance_eth' => 'decimal:8',
            'escrow_balance' => 'decimal:2',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function getTotalBalance()
    {
        return $this->balance_usdt + $this->escrow_balance;
    }

    public function canAfford($amount)
    {
        return $this->balance_usdt >= $amount;
    }
}
