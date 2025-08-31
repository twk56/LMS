<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index()
    {
        $user = Auth::user();
        $notifications = $this->notificationService->getUnreadNotifications($user);
        $preferences = $this->notificationService->getNotificationPreferences($user);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'preferences' => $preferences,
        ]);
    }

    public function markAsRead(Request $request)
    {
        $user = Auth::user();
        $notificationId = $request->input('notification_id');

        $success = $this->notificationService->markNotificationAsRead($user, $notificationId);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Notification marked as read' : 'Failed to mark notification as read',
        ]);
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        $success = $this->notificationService->markAllNotificationsAsRead($user);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'All notifications marked as read' : 'Failed to mark notifications as read',
        ]);
    }

    public function delete(Request $request)
    {
        $user = Auth::user();
        $notificationId = $request->input('notification_id');

        $success = $this->notificationService->deleteNotification($user, $notificationId);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Notification deleted' : 'Failed to delete notification',
        ]);
    }

    public function preferences()
    {
        $user = Auth::user();
        $preferences = $this->notificationService->getNotificationPreferences($user);

        return Inertia::render('Notifications/Preferences', [
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
