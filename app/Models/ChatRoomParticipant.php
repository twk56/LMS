<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatRoomParticipant extends Model
{
    use HasFactory;

    protected $table = 'chat_room_participants';

    protected $fillable = [
        'chat_room_id',
        'user_id',
        'role',
        'is_active',
        'last_seen_at',
        'joined_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_seen_at' => 'datetime',
        'joined_at' => 'datetime',
    ];

    /**
     * Get the chat room this participant belongs to
     */
    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    /**
     * Get the user who is a participant
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if participant is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if participant is moderator
     */
    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    /**
     * Update last seen timestamp
     */
    public function updateLastSeen(): void
    {
        $this->update(['last_seen_at' => now()]);
    }

    /**
     * Mark participant as active
     */
    public function markActive(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Mark participant as inactive
     */
    public function markInactive(): void
    {
        $this->update(['is_active' => false]);
    }
}
