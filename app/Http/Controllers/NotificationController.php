<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index()
    {
        try {
            Log::info('NotificationController@index: Starting notifications page load', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            $user = Auth::user();
            if (!$user) {
                Log::warning('NotificationController@index: User not authenticated, redirecting to login');
                return redirect()->route('login');
            }

            $notifications = $this->notificationService->getUnreadNotifications($user);
            $preferences = $this->notificationService->getNotificationPreferences($user);

            Log::info('NotificationController@index: Successfully loaded notifications', [
                'user_id' => $user->id,
                'notifications_count' => is_array($notifications) ? count($notifications) : $notifications->count()
            ]);

            return Inertia::render('notifications/index', [
                'notifications' => $notifications,
                'preferences' => $preferences,
            ]);

        } catch (\Exception $e) {
            Log::error('NotificationController@index: Fatal error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('notifications/index', [
                'notifications' => [],
                'preferences' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลการแจ้งเตือน'
            ]);
        }
    }

    public function markAsRead(Request $request)
    {
        try {
            Log::info('NotificationController@markAsRead: Starting mark as read', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'request_data' => $request->all()
            ]);

            $user = Auth::user();
            $notificationId = $request->input('notification_id');

            // Validate notification_id
            if (!$notificationId || !is_numeric($notificationId)) {
                Log::warning('NotificationController@markAsRead: Invalid notification ID', [
                    'user_id' => $user->id,
                    'notification_id' => $notificationId
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid notification ID',
                ], 400);
            }

            $success = $this->notificationService->markNotificationAsRead($user, (int)$notificationId);

            Log::info('NotificationController@markAsRead: Mark as read completed', [
                'user_id' => $user->id,
                'notification_id' => $notificationId,
                'success' => $success
            ]);

            // Check if this is an Inertia request
            if (request()->header('X-Inertia')) {
                // Return Inertia response for Inertia requests
                return redirect()->back()->with('success', $success ? 'Notification marked as read' : 'Failed to mark notification as read');
            } else {
                // Return JSON response for AJAX requests
                return response()->json([
                    'success' => $success,
                    'message' => $success ? 'Notification marked as read' : 'Failed to mark notification as read',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('NotificationController@markAsRead: Fatal error', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Check if this is an Inertia request
            if (request()->header('X-Inertia')) {
                return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านแล้ว');
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านแล้ว',
                ], 500);
            }
        }
    }

    public function markAllAsRead()
    {
        try {
            Log::info('NotificationController@markAllAsRead: Starting mark all as read', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email
            ]);

            $user = Auth::user();
            $success = $this->notificationService->markAllNotificationsAsRead($user);

            Log::info('NotificationController@markAllAsRead: Mark all as read completed', [
                'user_id' => $user->id,
                'success' => $success
            ]);

            // Check if this is an Inertia request
            if (request()->header('X-Inertia')) {
                // Return Inertia response for Inertia requests
                return redirect()->back()->with('success', $success ? 'All notifications marked as read' : 'Failed to mark notifications as read');
            } else {
                // Return JSON response for AJAX requests
                return response()->json([
                    'success' => $success,
                    'message' => $success ? 'All notifications marked as read' : 'Failed to mark notifications as read',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('NotificationController@markAllAsRead: Fatal error', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Check if this is an Inertia request
            if (request()->header('X-Inertia')) {
                return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านทั้งหมด');
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'เกิดข้อผิดพลาดในการทำเครื่องหมายว่าอ่านทั้งหมด',
                ], 500);
            }
        }
    }

    public function delete(Request $request)
    {
        try {
            Log::info('NotificationController@delete: Starting delete notification', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'request_data' => $request->all()
            ]);

            $user = Auth::user();
            $notificationId = $request->input('notification_id');

            // Validate notification_id
            if (!$notificationId || !is_numeric($notificationId)) {
                Log::warning('NotificationController@delete: Invalid notification ID', [
                    'user_id' => $user->id,
                    'notification_id' => $notificationId
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid notification ID',
                ], 400);
            }

            $success = $this->notificationService->deleteNotification($user, (int)$notificationId);

            Log::info('NotificationController@delete: Delete notification completed', [
                'user_id' => $user->id,
                'notification_id' => $notificationId,
                'success' => $success
            ]);

            // Check if this is an Inertia request
            if (request()->header('X-Inertia')) {
                // Return Inertia response for Inertia requests
                return redirect()->back()->with('success', $success ? 'Notification deleted' : 'Failed to delete notification');
            } else {
                // Return JSON response for AJAX requests
                return response()->json([
                    'success' => $success,
                    'message' => $success ? 'Notification deleted' : 'Failed to delete notification',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('NotificationController@delete: Fatal error', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()?->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Check if this is an Inertia request
            if (request()->header('X-Inertia')) {
                return redirect()->back()->with('error', 'เกิดข้อผิดพลาดในการลบการแจ้งเตือน');
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'เกิดข้อผิดพลาดในการลบการแจ้งเตือน',
                ], 500);
            }
        }
    }

    public function preferences()
    {
        $user = Auth::user();
        $preferences = $this->notificationService->getNotificationPreferences($user);

        return Inertia::render('notifications/preferences', [
            'preferences' => $preferences,
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $user = Auth::user();
        $preferences = $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'course_completion' => 'boolean',
            'lesson_reminders' => 'boolean',
            'quiz_reminders' => 'boolean',
            'achievements' => 'boolean',
            'streaks' => 'boolean',
            'dropout_risk' => 'boolean',
            'new_courses' => 'boolean',
            'system_maintenance' => 'boolean',
        ]);

        $success = $this->notificationService->updateNotificationPreferences($user, $preferences);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Preferences updated successfully' : 'Failed to update preferences',
        ]);
    }

    public function apiNotifications()
    {
        $user = Auth::user();
        $notifications = $this->notificationService->getUnreadNotifications($user);

        return response()->json([
            'data' => $notifications,
        ]);
    }

    public function apiPreferences()
    {
        $user = Auth::user();
        $preferences = $this->notificationService->getNotificationPreferences($user);

        return response()->json([
            'data' => $preferences,
        ]);
    }
}
