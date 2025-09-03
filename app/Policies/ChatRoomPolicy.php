<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ChatRoom;

class ChatRoomPolicy
{
    /**
     * Determine whether the user can view the chat room.
     */
    public function view(User $user, ChatRoom $chatRoom): bool
    {
        return $chatRoom->participants()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create chat rooms.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create chat rooms
    }

    /**
     * Determine whether the user can update the chat room.
     */
    public function update(User $user, ChatRoom $chatRoom): bool
    {
        $participant = $chatRoom->participants()
            ->where('user_id', $user->id)
            ->first();

        return $participant && in_array($participant->pivot->role, ['admin', 'moderator']);
    }

    /**
     * Determine whether the user can delete the chat room.
     */
    public function delete(User $user, ChatRoom $chatRoom): bool
    {
        $participant = $chatRoom->participants()
            ->where('user_id', $user->id)
            ->first();

        return $participant && $participant->pivot->role === 'admin';
    }

    /**
     * Determine whether the user can send messages to the chat room.
     */
    public function sendMessage(User $user, ChatRoom $chatRoom): bool
    {
        $participant = $chatRoom->participants()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $participant !== null;
    }
}
