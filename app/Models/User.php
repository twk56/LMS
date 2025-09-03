<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

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
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Get courses created by this user (for admin)
     */
    public function createdCourses()
    {
        return $this->hasMany(Course::class, 'created_by');
    }

    /**
     * Get courses enrolled by this user (for student)
     */
    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'course_user')
                    ->withPivot('status', 'completed_at', 'enrolled_at')
                    ->withTimestamps();
    }

    /**
     * Get lesson progress for this user
     */
    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * Get chat rooms where this user is a participant
     */
    public function chatRooms()
    {
        return $this->belongsToMany(ChatRoom::class, 'chat_room_participants')
                    ->withPivot('role', 'is_active', 'last_seen_at', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get chat messages sent by this user
     */
    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    /**
     * Get the user's appearance settings.
     */
    public function appearanceSetting()
    {
        return $this->hasOne(AppearanceSetting::class);
    }

    /**
     * Get progress for a specific lesson
     */
    public function getLessonProgress($lessonId)
    {
        return $this->lessonProgress()->where('lesson_id', $lessonId)->first();
    }

    /**
     * Mark lesson as started
     */
    public function startLesson($lessonId): void
    {
        $progress = $this->getLessonProgress($lessonId);
        
        if (!$progress) {
            $this->lessonProgress()->create([
                'lesson_id' => $lessonId,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        } elseif ($progress->status === 'not_started') {
            $progress->markAsStarted();
        }
    }

    /**
     * Mark lesson as completed
     */
    public function completeLesson($lessonId): void
    {
        $progress = $this->getLessonProgress($lessonId);
        
        if (!$progress) {
            $this->lessonProgress()->create([
                'lesson_id' => $lessonId,
                'status' => 'completed',
                'started_at' => now(),
                'completed_at' => now(),
            ]);
        } else {
            $progress->markAsCompleted();
        }
    }
}
