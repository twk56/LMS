<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NotificationService
{
    public function sendCourseCompletionNotification(User $user, Course $course): void
    {
        $notification = [
            'type' => 'course_completion',
            'title' => 'Course Completed! 🎉',
            'message' => "Congratulations! You have successfully completed '{$course->title}'",
            'user_id' => $user->id,
            'course_id' => $course->id,
            'timestamp' => now(),
            'priority' => 'high',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendLessonReminderNotification(User $user, Lesson $lesson): void
    {
        $notification = [
            'type' => 'lesson_reminder',
            'title' => 'Continue Your Learning 📚',
            'message' => "Don't forget to complete '{$lesson->title}' in '{$lesson->course->title}'",
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'course_id' => $lesson->course->id,
            'timestamp' => now(),
            'priority' => 'medium',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendQuizReminderNotification(User $user, Quiz $quiz): void
    {
        $notification = [
            'type' => 'quiz_reminder',
            'title' => 'Quiz Available! 📝',
            'message' => "A new quiz '{$quiz->title}' is available for you to take",
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'lesson_id' => $quiz->lesson->id,
            'course_id' => $quiz->lesson->course->id,
            'timestamp' => now(),
            'priority' => 'medium',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendAchievementNotification(User $user, string $achievement): void
    {
        $notification = [
            'type' => 'achievement',
            'title' => 'Achievement Unlocked! 🏆',
            'message' => "You've earned the '{$achievement}' achievement!",
            'user_id' => $user->id,
            'achievement' => $achievement,
            'timestamp' => now(),
            'priority' => 'high',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendStreakNotification(User $user, int $streakDays): void
    {
        $notification = [
            'type' => 'streak',
            'title' => 'Learning Streak! 🔥',
            'message' => "Amazing! You've maintained a {$streakDays}-day learning streak!",
            'user_id' => $user->id,
            'streak_days' => $streakDays,
            'timestamp' => now(),
            'priority' => 'medium',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendDropoutRiskNotification(User $user, array $riskFactors): void
    {
        $notification = [
            'type' => 'dropout_risk',
            'title' => 'Stay on Track! 📈',
            'message' => 'We noticed you might need some support. Check out your personalized recommendations.',
            'user_id' => $user->id,
            'risk_factors' => $riskFactors,
            'timestamp' => now(),
            'priority' => 'high',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendNewCourseNotification(User $user, Course $course): void
    {
        $notification = [
            'type' => 'new_course',
            'title' => 'New Course Available! 🆕',
            'message' => "A new course '{$course->title}' is now available for enrollment",
            'user_id' => $user->id,
            'course_id' => $course->id,
            'timestamp' => now(),
            'priority' => 'medium',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendSystemMaintenanceNotification(User $user, string $message, Carbon $scheduledTime): void
    {
        $notification = [
            'type' => 'system_maintenance',
            'title' => 'Scheduled Maintenance 🔧',
            'message' => $message,
            'user_id' => $user->id,
            'scheduled_time' => $scheduledTime,
            'timestamp' => now(),
            'priority' => 'low',
        ];

        $this->sendNotification($user, $notification);
        $this->logNotification($notification);
    }

    public function sendBulkNotification(array $userIds, array $notification): void
    {
        foreach ($userIds as $userId) {
            $notification['user_id'] = $userId;
            $notification['timestamp'] = now();
            
            $user = User::find($userId);
            if ($user) {
                $this->sendNotification($user, $notification);
            }
        }
        
        $this->logBulkNotification($notification, count($userIds));
    }

    public function getUnreadNotifications(User $user): array
    {
        // Simulate getting unread notifications from database
        return [
            [
                'id' => 1,
                'type' => 'course_completion',
                'title' => 'Course Completed! 🎉',
                'message' => 'Congratulations! You have successfully completed "Introduction to Programming"',
                'read' => false,
                'timestamp' => now()->subHours(2),
                'priority' => 'high',
            ],
            [
                'id' => 2,
                'type' => 'lesson_reminder',
                'title' => 'Continue Your Learning 📚',
                'message' => 'Don\'t forget to complete "Variables and Data Types"',
                'read' => false,
                'timestamp' => now()->subHours(6),
                'priority' => 'medium',
            ],
        ];
    }

    public function markNotificationAsRead(User $user, int $notificationId): bool
    {
        // Simulate marking notification as read
        Log::info("Notification {$notificationId} marked as read for user {$user->id}");
        return true;
    }

    public function markAllNotificationsAsRead(User $user): bool
    {
        // Simulate marking all notifications as read
        Log::info("All notifications marked as read for user {$user->id}");
        return true;
    }

    public function deleteNotification(User $user, int $notificationId): bool
    {
        // Simulate deleting notification
        Log::info("Notification {$notificationId} deleted for user {$user->id}");
        return true;
    }

    public function getNotificationPreferences(User $user): array
    {
        return [
            'email_notifications' => true,
            'push_notifications' => true,
            'sms_notifications' => false,
            'course_completion' => true,
            'lesson_reminders' => true,
            'quiz_reminders' => true,
            'achievements' => true,
            'streaks' => true,
            'dropout_risk' => true,
            'new_courses' => true,
            'system_maintenance' => false,
        ];
    }

    public function updateNotificationPreferences(User $user, array $preferences): bool
    {
        // Simulate updating notification preferences
        Log::info("Notification preferences updated for user {$user->id}", $preferences);
        return true;
    }

    private function sendNotification(User $user, array $notification): void
    {
        // Check user preferences
        $preferences = $this->getNotificationPreferences($user);
        $notificationType = $notification['type'];

        if (isset($preferences[$notificationType]) && $preferences[$notificationType]) {
            // Send email notification
            if ($preferences['email_notifications']) {
                $this->sendEmailNotification($user, $notification);
            }

            // Send push notification
            if ($preferences['push_notifications']) {
                $this->sendPushNotification($user, $notification);
            }

            // Send SMS notification
            if ($preferences['sms_notifications']) {
                $this->sendSMSNotification($user, $notification);
            }
        }
    }

    private function sendEmailNotification(User $user, array $notification): void
    {
        // Simulate sending email notification
        Log::info("Email notification sent to {$user->email}", [
            'notification_type' => $notification['type'],
            'title' => $notification['title'],
            'message' => $notification['message'],
        ]);
    }

    private function sendPushNotification(User $user, array $notification): void
    {
        // Simulate sending push notification
        Log::info("Push notification sent to user {$user->id}", [
            'notification_type' => $notification['type'],
            'title' => $notification['title'],
            'message' => $notification['message'],
        ]);
    }

    private function sendSMSNotification(User $user, array $notification): void
    {
        // Simulate sending SMS notification
        Log::info("SMS notification sent to user {$user->id}", [
            'notification_type' => $notification['type'],
            'title' => $notification['title'],
            'message' => $notification['message'],
        ]);
    }

    private function logNotification(array $notification): void
    {
        Log::info('Notification sent', [
            'user_id' => $notification['user_id'],
            'type' => $notification['type'],
            'title' => $notification['title'],
            'priority' => $notification['priority'],
            'timestamp' => $notification['timestamp'],
        ]);
    }

    private function logBulkNotification(array $notification, int $recipientCount): void
    {
        Log::info('Bulk notification sent', [
            'type' => $notification['type'],
            'title' => $notification['title'],
            'recipient_count' => $recipientCount,
            'timestamp' => now(),
        ]);
    }
}
