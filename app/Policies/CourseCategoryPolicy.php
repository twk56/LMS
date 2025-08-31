<?php

namespace App\Policies;

use App\Models\CourseCategory;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CourseCategoryPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow all authenticated users to view categories
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CourseCategory $category): bool
    {
        // Allow all authenticated users to view categories
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin users can create categories
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CourseCategory $category): bool
    {
        // Only admin users can update categories
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CourseCategory $category): bool
    {
        // Only admin users can delete categories
        // And only if the category has no courses
        return $user->role === 'admin' && $category->courses()->count() === 0;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CourseCategory $category): bool
    {
        // Only admin users can restore categories
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CourseCategory $category): bool
    {
        // Only admin users can permanently delete categories
        return $user->role === 'admin';
    }
}
