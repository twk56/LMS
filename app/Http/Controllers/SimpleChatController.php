<?php

namespace App\Http\Controllers;

use App\Models\SimpleChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SimpleChatController extends Controller
{
    /**
     * Display chat interface
     */
    public function index()
    {
        try {
            Log::info('SimpleChatController@index: Starting simple chat page load', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::warning('SimpleChatController@index: User not authenticated, redirecting to login');
                return redirect()->route('login');
            }

            // Get chat messages for this user
            $messages = $this->getChatMessages($user);
            
            // Get unread count
            $unreadCount = $this->getUserUnreadCount($user);

            Log::info('SimpleChatController@index: Successfully loaded simple chat', [
                'user_id' => $user->id,
                'messages_count' => count($messages),
                'unread_count' => $unreadCount
            ]);

            return Inertia::render('SimpleChat/Index', [
                'messages' => $messages,
                'unreadCount' => $unreadCount,
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('SimpleChatController@index: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('SimpleChat/Index', [
                'messages' => [],
                'unreadCount' => 0,
                'user' => Auth::user(),
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลแชท'
            ]);
        }
    }

    /**
     * Get chat messages
     */
    public function getMessages(): JsonResponse
    {
        $user = Auth::user();
        $messages = $this->getChatMessages($user);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Send message
     */
    public function sendMessage(Request $request): JsonResponse
    {
        try {
            Log::info('SimpleChatController@sendMessage: Starting send message', [
                'user_id' => Auth::id(),
                'message_length' => strlen($request->input('message', ''))
            ]);

            $request->validate([
                'message' => 'required|string|min:1|max:1000',
            ], [
                'message.required' => 'ข้อความไม่สามารถว่างได้',
                'message.min' => 'ข้อความต้องมีอย่างน้อย 1 ตัวอักษร',
                'message.max' => 'ข้อความยาวเกินไป (สูงสุด 1000 ตัวอักษร)',
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::error('SimpleChatController@sendMessage: User not authenticated');
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $message = SimpleChatMessage::create([
                'user_id' => $user->id,
                'message' => $request->message,
                'sender_type' => 'user',
            ]);

            Log::info('SimpleChatController@sendMessage: Message sent successfully', [
                'user_id' => $user->id,
                'message_id' => $message->id
            ]);

            return response()->json([
                'success' => true,
                'data' => $message->load('user:id,name,role'),
            ]);
        } catch (\Exception $e) {
            Log::error('SimpleChatController@sendMessage: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการส่งข้อความ'
            ], 500);
        }
    }

    /**
     * Admin send message
     */
    public function adminSendMessage(Request $request, int $userId): JsonResponse
    {
        $admin = Auth::user();
        
        if ($admin->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'ไม่มีสิทธิ์เข้าถึง',
            ], 403);
        }

        $request->validate([
            'message' => 'required|string|min:1|max:1000',
        ]);

        $message = SimpleChatMessage::create([
            'user_id' => $userId,
            'admin_id' => $admin->id,
            'message' => $request->message,
            'sender_type' => 'admin',
        ]);

        return response()->json([
            'success' => true,
            'data' => $message->load('admin:id,name,role'),
        ]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(): JsonResponse
    {
        try {
            Log::info('SimpleChatController@markAsRead: Starting mark as read', [
                'user_id' => Auth::id()
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::error('SimpleChatController@markAsRead: User not authenticated');
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            $updatedCount = SimpleChatMessage::where('user_id', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            Log::info('SimpleChatController@markAsRead: Messages marked as read', [
                'user_id' => $user->id,
                'updated_count' => $updatedCount
            ]);

            return response()->json([
                'success' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('SimpleChatController@markAsRead: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการอัปเดตสถานะข้อความ'
            ], 500);
        }
    }

    /**
     * Get unread count
     */
    public function getUnreadCount(): JsonResponse
    {
        $user = Auth::user();
        $count = $this->getUserUnreadCount($user);

        return response()->json([
            'success' => true,
            'data' => $count,
        ]);
    }

    /**
     * Admin get all conversations
     */
    public function adminIndex(): Response
    {
        $admin = Auth::user();
        
        if ($admin->role !== 'admin') {
            abort(403, 'ไม่มีสิทธิ์เข้าถึง');
        }

        // Get all users who have sent messages
        $conversations = User::whereHas('chatMessages')
            ->with(['chatMessages' => function($query) {
                $query->latest()->limit(1);
            }])
            ->get()
            ->map(function($user) {
                $latestMessage = $user->chatMessages->first();
                $unreadCount = $user->chatMessages()
                    ->where('sender_type', 'user')
                    ->where('is_read', false)
                    ->count();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'latest_message' => $latestMessage,
                    'unread_count' => $unreadCount,
                    'last_message_at' => $latestMessage?->created_at,
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();

        return Inertia::render('SimpleChat/AdminIndex', [
            'conversations' => $conversations,
            'admin' => $admin,
        ]);
    }

    /**
     * Admin get conversation with specific user
     */
    public function adminConversation(int $userId): Response
    {
        $admin = Auth::user();
        
        if ($admin->role !== 'admin') {
            abort(403, 'ไม่มีสิทธิ์เข้าถึง');
        }

        $user = User::findOrFail($userId);
        $messages = $this->getChatMessages($user);

        return Inertia::render('SimpleChat/AdminConversation', [
            'messages' => $messages,
            'user' => $user,
            'admin' => $admin,
        ]);
    }

    /**
     * Get chat messages for user
     */
    private function getChatMessages(User $user): array
    {
        return SimpleChatMessage::where('user_id', $user->id)
            ->with(['user:id,name,role', 'admin:id,name,role'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($message) {
                // Determine sender based on sender_type
                $sender = null;
                if ($message->sender_type === 'user') {
                    $sender = $message->user;
                } elseif ($message->sender_type === 'admin') {
                    $sender = $message->admin;
                }
                
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_type' => $message->sender_type,
                    'sender' => $sender ? [
                        'id' => $sender->id,
                        'name' => $sender->name,
                        'role' => $sender->role,
                    ] : null,
                    'is_read' => $message->is_read,
                    'created_at' => $message->created_at,
                ];
            })
            ->toArray();
    }

    /**
     * Get unread count for user
     */
    private function getUserUnreadCount(User $user): int
    {
        return SimpleChatMessage::where('user_id', $user->id)
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->count();
    }
}
