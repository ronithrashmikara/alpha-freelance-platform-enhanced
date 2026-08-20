<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'skills',
        'budget',
        'status',
        'images',
        'ai_breakdown',
        'breakdown_generated_at',
        'research_data',
        'research_query',
        'research_generated_at',
        'deadline',
        'assigned_to',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'images' => 'array',
            'ai_breakdown' => 'array',
            'research_data' => 'array',
            'budget' => 'decimal:2',
            'deadline' => 'datetime',
            'breakdown_generated_at' => 'datetime',
            'research_generated_at' => 'datetime',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Helper methods
    public function getLowestBid()
    {
        return $this->bids()->min('amount');
    }

    public function getBidCount()
    {
        return $this->bids()->count();
    }

    public function getAcceptedBid()
    {
        return $this->bids()->where('status', 'accepted')->first();
    }
}
