<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:admin');
    }

    /**
     * Display admin user management page
     */
    public function index()
    {
        try {
            Log::info('Admin\UserController@index: Starting admin user management page load', [
                'admin_user_id' => auth()->id(),
                'admin_user_email' => auth()->user()?->email
            ]);

            $users = User::with(['courses', 'chatMessages'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    try {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->role,
                            'enrolled_courses' => $user->courses ? $user->courses->count() : 0,
                            'total_messages' => $user->chatMessages ? $user->chatMessages->count() : 0,
                            'created_at' => $user->created_at,
                            'last_login' => $user->last_login_at,
                        ];
                    } catch (\Exception $e) {
                        Log::error('Admin\UserController@index: Error processing user', [
                            'user_id' => $user->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        return null;
                    }
                })->filter();

            $statistics = [
                'total_users' => User::count(),
                'admin_users' => User::where('role', 'admin')->count(),
                'student_users' => User::where('role', 'student')->count(),
                'active_users' => User::where('last_login_at', '>=', now()->subDays(30))->count(),
            ];

            Log::info('Admin\UserController@index: Successfully loaded admin user management', [
                'admin_user_id' => auth()->id(),
                'total_users' => $users->count(),
                'statistics' => $statistics
            ]);

            return Inertia::render('Admin/Users/Index', [
                'users' => $users,
                'statistics' => $statistics,
            ]);
        } catch (\Exception $e) {
            Log::error('Admin\UserController@index: Fatal error', [
                'admin_user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Inertia::render('Admin/Users/Index', [
                'users' => [],
                'statistics' => [
                    'total_users' => 0,
                    'admin_users' => 0,
                    'student_users' => 0,
                    'active_users' => 0,
                ],
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้'
            ]);
        }
    }
}