<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppearanceController extends Controller
{
    /**
     * Show the user's appearance settings page.
     */
    public function edit()
    {
        return Inertia::render('settings/appearance', [
            'mustVerifyEmail' => config('auth.must_verify_email'),
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's appearance settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'sometimes|in:light,dark,system',
            'colorScheme' => 'sometimes|in:blue,green,purple,orange',
            'reducedMotion' => 'sometimes|boolean',
            'highContrast' => 'sometimes|boolean',
            'fontSize' => 'sometimes|in:small,medium,large',
        ]);

        // Store appearance settings in user's session or database
        // For now, we'll just return success since settings are handled client-side
        return back()->with('status', 'Appearance settings updated successfully');
    }
}
