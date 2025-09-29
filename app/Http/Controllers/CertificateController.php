<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function index()
    {
        try {
            Log::info('CertificateController@index: Starting certificates page load', [
                'user_id' => auth()->id(),
                'user_email' => auth()->user()?->email
            ]);

            $user = auth()->user();
            if (!$user) {
                Log::warning('CertificateController@index: User not authenticated, redirecting to login');
                return redirect()->route('login');
            }

            $certificates = $user->certificates()
                ->with(['course'])
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('CertificateController@index: Successfully loaded certificates', [
                'user_id' => $user->id,
                'certificates_count' => $certificates->count()
            ]);

            return Inertia::render('certificates/Index', [
                'certificates' => $certificates,
            ]);

        } catch (\Exception $e) {
            Log::error('CertificateController@index: Fatal error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('certificates/Index', [
                'certificates' => [],
                'error' => 'เกิดข้อผิดพลาดในการโหลดข้อมูลใบรับรอง'
            ]);
        }
    }

    public function show(Certificate $certificate)
    {
        if ($certificate->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('certificates/show', [
            'certificate' => $certificate->load(['course', 'user']),
        ]);
    }

    public function generate(Course $course)
    {
        // ตรวจสอบว่าผู้ใช้เรียนจบหลักสูตรแล้วหรือไม่
        $enrollment = auth()->user()->enrolledCourses()
            ->where('course_id', $course->id)
            ->where('status', 'completed')
            ->first();

        if (!$enrollment) {
            return redirect()->back()->with('error', 'คุณต้องเรียนจบหลักสูตรก่อนจึงจะได้รับใบประกาศนียบัตร');
        }

        // ตรวจสอบว่ามีใบประกาศอยู่แล้วหรือไม่
        $existingCertificate = Certificate::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->first();

        if ($existingCertificate) {
            return redirect()->route('certificates.show', $existingCertificate)
                ->with('info', 'คุณมีใบประกาศนียบัตรสำหรับหลักสูตรนี้แล้ว');
        }

        // คำนวณคะแนนรวม
        $totalScore = 0;
        $totalQuizzes = 0;
        
        foreach ($course->lessons as $lesson) {
            $quiz = $lesson->quiz()->first();
            if ($quiz) {
                $attempt = $quiz->getUserAttempt(auth()->id());
                if ($attempt && $attempt->completed_at) {
                    $totalScore += $attempt->percentage;
                    $totalQuizzes++;
                }
            }
        }

        $finalScore = $totalQuizzes > 0 ? $totalScore / $totalQuizzes : 0;

        // สร้างใบประกาศ
        $certificate = Certificate::create([
            'user_id' => auth()->id(),
            'course_id' => $course->id,
            'certificate_number' => Certificate::generateCertificateNumber(),
            'final_score' => $finalScore,
            'issued_at' => now(),
            'expires_at' => now()->addYears(2), // หมดอายุใน 2 ปี
        ]);

        return redirect()->route('certificates.show', $certificate)
            ->with('success', 'สร้างใบประกาศนียบัตรสำเร็จ');
    }

    public function download(Certificate $certificate)
    {
        if ($certificate->user_id !== auth()->id()) {
            abort(403);
        }

        // สร้าง PDF ใบประกาศ
        // ใช้ library เช่น DomPDF หรือ TCPDF
        // สำหรับตอนนี้จะ redirect ไปหน้าแสดงใบประกาศ
        
        return redirect()->route('certificates.show', $certificate);
    }
}
