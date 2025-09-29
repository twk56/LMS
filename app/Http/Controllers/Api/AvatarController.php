<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    /**
     * Get user avatar
     */
    public function show(Request $request, $id)
    {
        try {
            // Check if ID is valid
            if (!$id || $id === 'undefined' || !is_numeric($id)) {
                return $this->generateDefaultAvatar('User');
            }

            $user = User::find($id);
            
            if (!$user) {
                return $this->generateDefaultAvatar('User');
            }

            // Check if user has custom avatar
            if ($user->avatar && Storage::exists($user->avatar)) {
                return Storage::response($user->avatar);
            }

            // Generate default avatar based on user initials
            return $this->generateDefaultAvatar($user->name);
            
        } catch (\Exception $e) {
            // Return default avatar on any error
            return $this->generateDefaultAvatar('User');
        }
    }

    /**
     * Generate default avatar with user initials
     */
    private function generateDefaultAvatar(string $name): Response
    {
        $initials = $this->getInitials($name);
        $colors = [
            ['bg' => '#3B82F6', 'text' => '#FFFFFF'], // Blue
            ['bg' => '#10B981', 'text' => '#FFFFFF'], // Green
            ['bg' => '#F59E0B', 'text' => '#FFFFFF'], // Yellow
            ['bg' => '#EF4444', 'text' => '#FFFFFF'], // Red
            ['bg' => '#8B5CF6', 'text' => '#FFFFFF'], // Purple
            ['bg' => '#06B6D4', 'text' => '#FFFFFF'], // Cyan
            ['bg' => '#84CC16', 'text' => '#FFFFFF'], // Lime
            ['bg' => '#F97316', 'text' => '#FFFFFF'], // Orange
        ];

        $colorIndex = crc32($name) % count($colors);
        $color = $colors[$colorIndex];

        $svg = $this->generateAvatarSVG($initials, $color['bg'], $color['text']);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Get initials from name
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', trim($name));
        $initials = '';
        
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }
        
        return substr($initials, 0, 2);
    }

    /**
     * Generate SVG avatar
     */
    private function generateAvatarSVG(string $initials, string $bgColor, string $textColor): string
    {
        $size = 100;
        $fontSize = $size * 0.4;
        
        return sprintf(
            '<svg width="%d" height="%d" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">
                <rect width="%d" height="%d" fill="%s" rx="%d"/>
                <text x="50%%" y="50%%" font-family="system-ui, -apple-system, sans-serif" font-size="%d" font-weight="600" text-anchor="middle" dominant-baseline="central" fill="%s">%s</text>
            </svg>',
            $size,
            $size,
            $size,
            $size,
            $size,
            $size,
            $bgColor,
            $size / 2,
            $fontSize,
            $textColor,
            htmlspecialchars($initials)
        );
    }
}
