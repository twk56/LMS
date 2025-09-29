<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'content',
        'content_type',
        'order',
        'status',
        'youtube_url',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }


    public function files(): HasMany
    {
        return $this->hasMany(LessonFile::class)->orderBy('order');
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function nextLesson(): ?Lesson
    {
        try {
            if (!$this->course) {
                Log::warning('Lesson::nextLesson: Course relationship not loaded', [
                    'lesson_id' => $this->id
                ]);
                return null;
            }

            return $this->course->lessons()
                ->where('order', '>', $this->order)
                ->where('status', 'published')
                ->orderBy('order')
                ->first();
        } catch (\Exception $e) {
            Log::error('Lesson::nextLesson: Error getting next lesson', [
                'lesson_id' => $this->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function previousLesson(): ?Lesson
    {
        try {
            if (!$this->course) {
                Log::warning('Lesson::previousLesson: Course relationship not loaded', [
                    'lesson_id' => $this->id
                ]);
                return null;
            }

            return $this->course->lessons()
                ->where('order', '<', $this->order)
                ->where('status', 'published')
                ->orderBy('order', 'desc')
                ->first();
        } catch (\Exception $e) {
            Log::error('Lesson::previousLesson: Error getting previous lesson', [
                'lesson_id' => $this->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function getUserProgress($userId): ?LessonProgress
    {
        try {
            if (!$userId) {
                Log::warning('Lesson::getUserProgress: User ID not provided', [
                    'lesson_id' => $this->id
                ]);
                return null;
            }

            return $this->progress()->where('user_id', $userId)->first();
        } catch (\Exception $e) {
            Log::error('Lesson::getUserProgress: Error getting user progress', [
                'lesson_id' => $this->id,
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Mark lesson as started
     */
    public function markAsStarted(): void
    {
        $this->update(['status' => 'in_progress']);
    }

    /**
     * Mark lesson as completed for a specific user
     */
    public function markAsCompleted(int $userId): void
    {
        $this->progress()->updateOrCreate(
            ['user_id' => $userId],
            ['completed_at' => now()]
        );
    }

    /**
     * Check if lesson is completed by a specific user
     */
    public function isCompletedBy(int $userId): bool
    {
        return $this->progress()
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->exists();
    }

    /**
     * Get the next lesson in the course
     */
    public function getNextLesson(): ?Lesson
    {
        return Lesson::where('course_id', $this->course_id)
            ->where('order', '>', $this->order)
            ->orderBy('order')
            ->first();
    }

    /**
     * Get the previous lesson in the course
     */
    public function getPreviousLesson(): ?Lesson
    {
        return Lesson::where('course_id', $this->course_id)
            ->where('order', '<', $this->order)
            ->orderBy('order', 'desc')
            ->first();
    }
}
