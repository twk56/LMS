<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class LessonFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'filename',
        'original_name',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'title',
        'description',
        'order',
        'is_active',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function course()
    {
        return $this->hasOneThrough(Course::class, Lesson::class, 'id', 'id', 'lesson_id', 'course_id');
    }

    // Helper methods
    public function getUrlAttribute()
    {
        return Storage::url($this->file_path);
    }

    public function getFormattedSizeAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function isImage()
    {
        return in_array($this->file_type, ['image']);
    }

    public function isVideo()
    {
        return in_array($this->file_type, ['video']);
    }

    public function isPdf()
    {
        return $this->mime_type === 'application/pdf';
    }

    public function getIconAttribute()
    {
        if ($this->isImage()) {
            return 'image';
        } elseif ($this->isVideo()) {
            return 'video';
        } elseif ($this->isPdf()) {
            return 'file-text';
        } else {
            return 'file';
        }
    }
}
