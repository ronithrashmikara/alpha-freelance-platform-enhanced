<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'bio',
        'skills',
        'rating',
        'total_projects',
        'is_verified',
        'status',
        'verification_hash',
        'hash_generated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'verification_hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'skills' => 'array',
            'rating' => 'decimal:2',
            'is_verified' => 'boolean',
            'hash_generated_at' => 'datetime',
        ];
    }

    // Relationships
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function sentPayments()
    {
        return $this->hasMany(Payment::class, 'payer_id');
    }

    public function receivedPayments()
    {
        return $this->hasMany(Payment::class, 'payee_id');
    }

    public function raisedDisputes()
    {
        return $this->hasMany(Dispute::class, 'complainant_id');
    }

    public function disputesAgainst()
    {
        return $this->hasMany(Dispute::class, 'respondent_id');
    }

    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'reviewed_user_id');
    }

    /**
     * Generate a unique verification hash for the user
     */
    public function generateVerificationHash()
    {
        do {
            $hash = strtoupper(bin2hex(random_bytes(4))); // 8 character hex string
        } while (self::where('verification_hash', $hash)->exists());

        $this->update([
            'verification_hash' => $hash,
            'hash_generated_at' => now(),
        ]);

        return $hash;
    }

    /**
     * Check if verification hash is valid (not expired)
     */
    public function isHashValid()
    {
        if (!$this->hash_generated_at) {
            return false;
        }

        // Hash expires after 24 hours
        return $this->hash_generated_at->diffInHours(now()) < 24;
    }
}
