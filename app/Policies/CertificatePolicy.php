<?php

namespace App\Policies;

use App\Models\Certificate;
use App\Models\User;

class CertificatePolicy
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
    public function view(User $user, Certificate $certificate): bool
    {
        // Admin can view all certificates
        if ($user->isAdmin()) {
            return true;
        }

        // User can only view their own certificates
        return $certificate->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Users can create certificates for courses they've completed
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Certificate $certificate): bool
    {
        // Only admin can update certificates
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Certificate $certificate): bool
    {
        // Only admin can delete certificates
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Certificate $certificate): bool
    {
        // Only admin can restore certificates
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Certificate $certificate): bool
    {
        // Only admin can permanently delete certificates
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can download the certificate.
     */
    public function download(User $user, Certificate $certificate): bool
    {
        // Admin can download any certificate
        if ($user->isAdmin()) {
            return true;
        }

        // User can only download their own certificates
        return $certificate->user_id === $user->id;
    }

    /**
     * Determine whether the user can generate a certificate for a course.
     */
    public function generate(User $user, $course): bool
    {
        // Admin cannot generate certificates for themselves
        if ($user->isAdmin()) {
            return false;
        }

        // User must be enrolled and completed the course
        $enrollment = $user->enrolledCourses()
            ->where('course_id', $course->id)
            ->where('status', 'completed')
            ->first();

        return $enrollment !== null;
    }
}
