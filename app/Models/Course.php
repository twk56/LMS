<?php

namespace App\Models;

use App\Policies\CoursePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'status',
        'created_by',
        'category_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the policy for the model.
     */
    public static function policy(): string
    {
        return CoursePolicy::class;
    }

    /**
     * Get the creator of the course
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the category of the course
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    /**
     * Get the lessons for this course
     */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }


    /**
     * Get the enrolled students
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_user')
                    ->withPivot('status', 'enrolled_at', 'completed_at')
                    ->withTimestamps();
    }

    /**
     * Alias for students relationship
     */
    public function users(): BelongsToMany
    {
        return $this->students();
    }

    /**
     * Get certificates for this course
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Check if course is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Get published lessons
     */
    public function publishedLessons()
    {
        return $this->lessons()->where('status', 'published');
    }


    /**
     * Check if user is enrolled in this course
     */
    public function isEnrolledBy(User $user): bool
    {
        return $this->students()->where('user_id', $user->id)->exists();
    }

    /**
     * Get user's enrollment status
     */
    public function getUserEnrollment(User $user)
    {
        return $this->students()->where('user_id', $user->id)->first();
    }

    /**
     * Get completion percentage for a user
     */
    public function getCompletionPercentage(User $user): float
    {
        $totalLessons = $this->publishedLessons()->count();
        if ($totalLessons === 0) return 0;

        $completedLessons = $user->lessonProgress()
            ->whereIn('lesson_id', $this->publishedLessons()->pluck('id'))
            ->where('status', 'completed')
            ->count();

        return round(($completedLessons / $totalLessons) * 100, 2);
    }

    /**
     * Get progress percentage for a user (alias for getCompletionPercentage)
     */
    public function getProgressPercentage(User $user): float
    {
        return $this->getCompletionPercentage($user);
    }

    /**
     * Check if course is completed by user
     */
    public function isCompletedBy(User $user): bool
    {
        $totalLessons = $this->publishedLessons()->count();
        if ($totalLessons === 0) return false;

        $completedLessons = $user->lessonProgress()
            ->whereIn('lesson_id', $this->publishedLessons()->pluck('id'))
            ->where('status', 'completed')
            ->count();

        return $completedLessons === $totalLessons;
    }
}
