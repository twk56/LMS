<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function quiz(): HasMany
    {
        return $this->hasMany(Quiz::class);
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
        return $this->course->lessons()
            ->where('order', '>', $this->order)
            ->where('status', 'published')
            ->orderBy('order')
            ->first();
    }

    public function previousLesson(): ?Lesson
    {
        return $this->course->lessons()
            ->where('order', '<', $this->order)
            ->where('status', 'published')
            ->orderBy('order', 'desc')
            ->first();
    }

    public function getUserProgress($userId): ?LessonProgress
    {
        return $this->progress()->where('user_id', $userId)->first();
    }
}
