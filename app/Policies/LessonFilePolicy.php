<?php

namespace App\Policies;

use App\Models\LessonFile;
use App\Models\User;

class LessonFilePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LessonFile $lessonFile): bool
    {
        // Admin can view all lesson files
        if ($user->isAdmin()) {
            return true;
        }

        // Student can view active lesson files from enrolled courses
        return $lessonFile->is_active && 
               $user->enrolledCourses()->where('course_id', $lessonFile->lesson->course_id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LessonFile $lessonFile): bool
    {
        return $user->isAdmin() && $lessonFile->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LessonFile $lessonFile): bool
    {
        return $user->isAdmin() && $lessonFile->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, LessonFile $lessonFile): bool
    {
        return $user->isAdmin() && $lessonFile->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, LessonFile $lessonFile): bool
    {
        return $user->isAdmin() && $lessonFile->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can download the file.
     */
    public function download(User $user, LessonFile $lessonFile): bool
    {
        // Admin can download any file
        if ($user->isAdmin()) {
            return true;
        }

        // Student can download active files from enrolled courses
        return $lessonFile->is_active && 
               $user->enrolledCourses()->where('course_id', $lessonFile->lesson->course_id)->exists();
    }
}
