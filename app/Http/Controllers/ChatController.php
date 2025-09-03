<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\ChatRoomParticipant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Pusher\Pusher;

class ChatController extends Controller
{
    protected Pusher $pusher;

    public function __construct()
    {
        // Only initialize Pusher if broadcasting is configured
        if (config('broadcasting.connections.pusher.key')) {
            $this->pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                config('broadcasting.connections.pusher.options')
            );
        }
    }

    /**
     * Display chat interface
     */
    public function index(): Response
    {
        $user = Auth::user();
        $chatRooms = $this->getUserChatRooms($user);
        
        return Inertia::render('Chat/Index', [
            'chatRooms' => $chatRooms,
            'user' => $user,
        ]);
    }

    /**
     * Get chat room messages
     */
    public function getMessages(Request $request, int $roomId): JsonResponse
    {
        $room = ChatRoom::findOrFail($roomId);
        $this->authorize('view', $room);

        $messages = $room->messages()
            ->with('user:id,name,role')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Send message to chat room
     */
    public function sendMessage(Request $request, int $roomId): JsonResponse
    {
        $room = ChatRoom::findOrFail($roomId);
        $this->authorize('view', $room);

        $request->validate([
            'message' => 'required|string|max:1000',
            'type' => 'sometimes|string|in:text,image,file,system',
        ]);

        $message = $room->messages()->create([
            'user_id' => Auth::id(),
            'message' => $request->message,
            'type' => $request->type ?? 'text',
            'metadata' => $request->metadata ?? null,
        ]);

        // Load user relationship
        $message->load('user:id,name,role');

        // Broadcast to Pusher if configured
        if (isset($this->pusher)) {
            $this->pusher->trigger("chat-room-{$roomId}", 'new-message', [
                'message' => $message,
                'room_id' => $roomId,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    /**
     * Create new chat room
     */
    public function createRoom(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:private,group,support',
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $room = ChatRoom::create([
            'name' => $request->name,
            'type' => $request->type,
            'status' => 'active',
        ]);

        // Add participants
        $participants = array_merge([Auth::id()], $request->participant_ids);
        foreach ($participants as $userId) {
            $role = $userId === Auth::id() ? 'admin' : 'participant';
            $room->participants()->attach($userId, [
                'role' => $role,
                'joined_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $room->load('participants'),
        ]);
    }

    /**
     * Get or create support chat room
     */
    public function getSupportChat(): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user already has a support chat
        $existingRoom = ChatRoom::where('type', 'support')
            ->whereHas('participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if ($existingRoom) {
            return response()->json([
                'success' => true,
                'data' => $existingRoom->load('participants', 'latestMessage'),
            ]);
        }

        // Create new support chat room
        $room = ChatRoom::create([
            'name' => "Support Chat - {$user->name}",
            'type' => 'support',
            'status' => 'active',
        ]);

        // Add user and admin/support staff
        $room->participants()->attach($user->id, [
            'role' => 'participant',
            'joined_at' => now(),
        ]);

        // Add admin users (you can customize this logic)
        $adminUsers = User::where('role', 'admin')->take(3)->get();
        foreach ($adminUsers as $admin) {
            $room->participants()->attach($admin->id, [
                'role' => 'admin',
                'joined_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $room->load('participants', 'latestMessage'),
        ]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, int $roomId): JsonResponse
    {
        $room = ChatRoom::findOrFail($roomId);
        $this->authorize('view', $room);

        $messageIds = $request->input('message_ids', []);
        
        if (empty($messageIds)) {
            // Mark all unread messages as read
            $room->messages()
                ->where('user_id', '!=', Auth::id())
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        } else {
            // Mark specific messages as read
            $room->messages()
                ->whereIn('id', $messageIds)
                ->where('user_id', '!=', Auth::id())
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read',
        ]);
    }

    /**
     * Get user's chat rooms
     */
    protected function getUserChatRooms(User $user): array
    {
        $rooms = $user->chatRooms()
            ->with(['latestMessage.user:id,name', 'participants:id,name,role'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return $rooms->map(function ($room) use ($user) {
            $unreadCount = $room->messages()
                ->where('user_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();

            return [
                'id' => $room->id,
                'name' => $room->name,
                'type' => $room->type,
                'status' => $room->status,
                'unread_count' => $unreadCount,
                'latest_message' => $room->latestMessage,
                'participants' => $room->participants->take(3), // Show first 3 participants
                'updated_at' => $room->updated_at,
            ];
        })->toArray();
    }
}
