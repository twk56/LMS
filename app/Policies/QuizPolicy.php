<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
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
    public function view(User $user, Quiz $quiz): bool
    {
        // Admin can view all quizzes
        if ($user->isAdmin()) {
            return true;
        }

        // Student can view active quizzes from enrolled courses
        return $quiz->is_active && 
               $user->enrolledCourses()->where('course_id', $quiz->lesson->course_id)->exists();
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
    public function update(User $user, Quiz $quiz): bool
    {
        return $user->isAdmin() && $quiz->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Quiz $quiz): bool
    {
        return $user->isAdmin() && $quiz->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Quiz $quiz): bool
    {
        return $user->isAdmin() && $quiz->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Quiz $quiz): bool
    {
        return $user->isAdmin() && $quiz->lesson->course->created_by === $user->id;
    }

    /**
     * Determine whether the user can take the quiz.
     */
    public function take(User $user, Quiz $quiz): bool
    {
        // Admin cannot take quizzes
        if ($user->isAdmin()) {
            return false;
        }

        // Student can take active quizzes from enrolled courses
        return $quiz->is_active && 
               $user->enrolledCourses()->where('course_id', $quiz->lesson->course_id)->exists();
    }
}
