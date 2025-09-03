<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ChatRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get messages for this chat room
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    /**
     * Get participants in this chat room
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'chat_room_participants')
                    ->withPivot('role', 'is_active', 'last_seen_at', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get the latest message in this room
     */
    public function latestMessage()
    {
        return $this->hasOne(ChatMessage::class)->latestOfMany();
    }

    /**
     * Check if room is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if room is private
     */
    public function isPrivate(): bool
    {
        return $this->type === 'private';
    }

    /**
     * Check if room is support chat
     */
    public function isSupport(): bool
    {
        return $this->type === 'support';
    }
}
