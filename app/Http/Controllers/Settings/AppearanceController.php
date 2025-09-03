<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppearanceSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppearanceController extends Controller
{
    /**
     * Show the user's appearance settings page.
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        $appearanceSetting = $user->appearanceSetting;
        
        return Inertia::render('settings/appearance', [
            'mustVerifyEmail' => config('auth.must_verify_email'),
            'status' => session('status'),
            'currentTheme' => $appearanceSetting?->theme ?? 'system',
        ]);
    }

    /**
     * Update the user's appearance settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'required|in:light,dark,system',
        ]);

        $user = $request->user();
        
        // Update or create appearance setting
        $user->appearanceSetting()->updateOrCreate(
            ['user_id' => $user->id],
            ['theme' => $validated['theme']]
        );

        return back()->with('status', 'การตั้งค่าธีมอัปเดตเรียบร้อยแล้ว');
    }
}
