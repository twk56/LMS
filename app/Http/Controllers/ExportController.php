<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\Certificate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use Exception;

class ExportController extends Controller
{
    /**
     * Export courses data
     */
    public function exportCourses(Request $request)
    {
        try {
            $this->authorize('export', Course::class);

            $format = $request->get('format', 'xlsx');
            $filters = $request->only(['status', 'category_id', 'date_from', 'date_to']);

            $query = Course::with(['creator', 'category', 'lessons'])
                ->when($filters['status'], function ($query, $status) {
                    $query->where('status', $status);
                })
                ->when($filters['category_id'], function ($query, $categoryId) {
                    $query->where('category_id', $categoryId);
                })
                ->when($filters['date_from'], function ($query, $dateFrom) {
                    $query->where('created_at', '>=', $dateFrom);
                })
                ->when($filters['date_to'], function ($query, $dateTo) {
                    $query->where('created_at', '<=', $dateTo);
                });

            if (Auth::user()->role !== 'admin') {
                $query->where('created_by', Auth::id());
            }

            $courses = $query->get();

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set headers
            $headers = [
                'ID', 'ชื่อหลักสูตร', 'คำอธิบาย', 'สถานะ', 'หมวดหมู่', 
                'ผู้สร้าง', 'จำนวนบทเรียน', 'จำนวนผู้เรียน', 'วันที่สร้าง', 'วันที่อัปเดต'
            ];

            foreach ($headers as $colIndex => $header) {
                $sheet->setCellValueByColumnAndRow($colIndex + 1, 1, $header);
            }

            // Add data
            foreach ($courses as $rowIndex => $course) {
                $row = $rowIndex + 2;
                $sheet->setCellValueByColumnAndRow(1, $row, $course->id);
                $sheet->setCellValueByColumnAndRow(2, $row, $course->title);
                $sheet->setCellValueByColumnAndRow(3, $row, $course->description);
                $sheet->setCellValueByColumnAndRow(4, $row, $course->status);
                $sheet->setCellValueByColumnAndRow(5, $row, $course->category?->name ?? 'ไม่มีหมวดหมู่');
                $sheet->setCellValueByColumnAndRow(6, $row, $course->creator?->name ?? 'ไม่ทราบ');
                $sheet->setCellValueByColumnAndRow(7, $row, $course->lessons->count());
                $sheet->setCellValueByColumnAndRow(8, $row, $course->students->count());
                $sheet->setCellValueByColumnAndRow(9, $row, $course->created_at?->format('Y-m-d H:i:s'));
                $sheet->setCellValueByColumnAndRow(10, $row, $course->updated_at?->format('Y-m-d H:i:s'));
            }

            // Auto-size columns
            foreach (range(1, count($headers)) as $colIndex) {
                $sheet->getColumnDimensionByColumn($colIndex)->setAutoSize(true);
            }

            $filename = 'courses_' . date('Y-m-d_H-i-s') . '.' . $format;

            if ($format === 'csv') {
                $writer = new Csv($spreadsheet);
                $content = '';
                ob_start();
                $writer->save('php://output');
                $content = ob_get_clean();
                
                return Response::make($content, 200, [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                ]);
            } else {
                $writer = new Xlsx($spreadsheet);
                $filepath = storage_path('app/temp/' . $filename);
                
                if (!file_exists(dirname($filepath))) {
                    mkdir(dirname($filepath), 0755, true);
                }
                
                $writer->save($filepath);
                
                return response()->download($filepath, $filename)->deleteFileAfterSend();
            }

        } catch (Exception $e) {
            \Log::error('Error exporting courses', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการส่งออกข้อมูล: ' . $e->getMessage()]);
        }
    }

    /**
     * Export user progress data
     */
    public function exportUserProgress(Request $request, Course $course)
    {
        try {
            $this->authorize('export', $course);

            $format = $request->get('format', 'xlsx');
            $filters = $request->only(['status', 'date_from', 'date_to']);

            $query = $course->students()
                ->with(['lessonProgress' => function ($query) use ($course) {
                    $query->whereIn('lesson_id', $course->lessons->pluck('id'));
                }])
                ->when($filters['status'], function ($query, $status) {
                    $query->where('course_user.status', $status);
                })
                ->when($filters['date_from'], function ($query, $dateFrom) {
                    $query->where('course_user.enrolled_at', '>=', $dateFrom);
                })
                ->when($filters['date_to'], function ($query, $dateTo) {
                    $query->where('course_user.enrolled_at', '<=', $dateTo);
                });

            $students = $query->get();

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set headers
            $headers = [
                'ID ผู้ใช้', 'ชื่อผู้ใช้', 'อีเมล', 'วันที่ลงทะเบียน', 'สถานะ', 
                'บทเรียนที่เริ่ม', 'บทเรียนที่เสร็จสิ้น', 'เปอร์เซ็นต์ความคืบหน้า'
            ];

            foreach ($headers as $colIndex => $header) {
                $sheet->setCellValueByColumnAndRow($colIndex + 1, 1, $header);
            }

            // Add data
            foreach ($students as $rowIndex => $student) {
                $row = $rowIndex + 2;
                $progress = $student->lessonProgress;
                $startedLessons = $progress->where('status', '!=', 'not_started')->count();
                $completedLessons = $progress->where('status', 'completed')->count();
                $totalLessons = $course->lessons->count();
                $completionPercentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0;

                $sheet->setCellValueByColumnAndRow(1, $row, $student->id);
                $sheet->setCellValueByColumnAndRow(2, $row, $student->name);
                $sheet->setCellValueByColumnAndRow(3, $row, $student->email);
                $sheet->setCellValueByColumnAndRow(4, $row, $student->pivot->enrolled_at?->format('Y-m-d H:i:s'));
                $sheet->setCellValueByColumnAndRow(5, $row, $student->pivot->status ?? 'enrolled');
                $sheet->setCellValueByColumnAndRow(6, $row, $startedLessons);
                $sheet->setCellValueByColumnAndRow(7, $row, $completedLessons);
                $sheet->setCellValueByColumnAndRow(8, $row, $completionPercentage . '%');
            }

            // Auto-size columns
            foreach (range(1, count($headers)) as $colIndex) {
                $sheet->getColumnDimensionByColumn($colIndex)->setAutoSize(true);
            }

            $filename = 'user_progress_' . $course->id . '_' . date('Y-m-d_H-i-s') . '.' . $format;

            if ($format === 'csv') {
                $writer = new Csv($spreadsheet);
                $content = '';
                ob_start();
                $writer->save('php://output');
                $content = ob_get_clean();
                
                return Response::make($content, 200, [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                ]);
            } else {
                $writer = new Xlsx($spreadsheet);
                $filepath = storage_path('app/temp/' . $filename);
                
                if (!file_exists(dirname($filepath))) {
                    mkdir(dirname($filepath), 0755, true);
                }
                
                $writer->save($filepath);
                
                return response()->download($filepath, $filename)->deleteFileAfterSend();
            }

        } catch (Exception $e) {
            \Log::error('Error exporting user progress', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการส่งออกข้อมูล: ' . $e->getMessage()]);
        }
    }

    /**
     * Export quiz results
     */
    public function exportQuizResults(Request $request, Course $course)
    {
        try {
            $this->authorize('export', $course);

            $format = $request->get('format', 'xlsx');
            $lessonId = $request->get('lesson_id');

            $query = Quiz::with(['lesson', 'attempts.user'])
                ->whereHas('lesson', function ($query) use ($course) {
                    $query->where('course_id', $course->id);
                });

            if ($lessonId) {
                $query->where('lesson_id', $lessonId);
            }

            $quizzes = $query->get();

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set headers
            $headers = [
                'ID แบบทดสอบ', 'บทเรียน', 'ชื่อแบบทดสอบ', 'ผู้ใช้', 'คะแนน', 
                'คะแนนเต็ม', 'เปอร์เซ็นต์', 'ผ่าน/ไม่ผ่าน', 'วันที่ทำ', 'เวลาที่ใช้'
            ];

            foreach ($headers as $colIndex => $header) {
                $sheet->setCellValueByColumnAndRow($colIndex + 1, 1, $header);
            }

            $rowIndex = 1;
            foreach ($quizzes as $quiz) {
                foreach ($quiz->attempts as $attempt) {
                    $rowIndex++;
                    $timeUsed = $attempt->started_at && $attempt->completed_at 
                        ? round((strtotime($attempt->completed_at) - strtotime($attempt->started_at)) / 60, 2)
                        : 0;

                    $sheet->setCellValueByColumnAndRow(1, $rowIndex, $quiz->id);
                    $sheet->setCellValueByColumnAndRow(2, $rowIndex, $quiz->lesson->title);
                    $sheet->setCellValueByColumnAndRow(3, $rowIndex, $quiz->title);
                    $sheet->setCellValueByColumnAndRow(4, $rowIndex, $attempt->user->name);
                    $sheet->setCellValueByColumnAndRow(5, $rowIndex, $attempt->score);
                    $sheet->setCellValueByColumnAndRow(6, $rowIndex, $attempt->total_points);
                    $sheet->setCellValueByColumnAndRow(7, $rowIndex, $attempt->percentage . '%');
                    $sheet->setCellValueByColumnAndRow(8, $rowIndex, $attempt->passed ? 'ผ่าน' : 'ไม่ผ่าน');
                    $sheet->setCellValueByColumnAndRow(9, $rowIndex, $attempt->completed_at?->format('Y-m-d H:i:s'));
                    $sheet->setCellValueByColumnAndRow(10, $rowIndex, $timeUsed . ' นาที');
                }
            }

            // Auto-size columns
            foreach (range(1, count($headers)) as $colIndex) {
                $sheet->getColumnDimensionByColumn($colIndex)->setAutoSize(true);
            }

            $filename = 'quiz_results_' . $course->id . '_' . date('Y-m-d_H-i-s') . '.' . $format;

            if ($format === 'csv') {
                $writer = new Csv($spreadsheet);
                $content = '';
                ob_start();
                $writer->save('php://output');
                $content = ob_get_clean();
                
                return Response::make($content, 200, [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                ]);
            } else {
                $writer = new Xlsx($spreadsheet);
                $filepath = storage_path('app/temp/' . $filename);
                
                if (!file_exists(dirname($filepath))) {
                    mkdir(dirname($filepath), 0755, true);
                }
                
                $writer->save($filepath);
                
                return response()->download($filepath, $filename)->deleteFileAfterSend();
            }

        } catch (Exception $e) {
            \Log::error('Error exporting quiz results', [
                'course_id' => $course->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการส่งออกข้อมูล: ' . $e->getMessage()]);
        }
    }

    /**
     * Export certificates
     */
    public function exportCertificates(Request $request)
    {
        try {
            $this->authorize('export', Certificate::class);

            $format = $request->get('format', 'xlsx');
            $filters = $request->only(['course_id', 'date_from', 'date_to']);

            $query = Certificate::with(['user', 'course'])
                ->when($filters['course_id'], function ($query, $courseId) {
                    $query->where('course_id', $courseId);
                })
                ->when($filters['date_from'], function ($query, $dateFrom) {
                    $query->where('issued_at', '>=', $dateFrom);
                })
                ->when($filters['date_to'], function ($query, $dateTo) {
                    $query->where('issued_at', '<=', $dateTo);
                });

            if (Auth::user()->role !== 'admin') {
                $query->where('user_id', Auth::id());
            }

            $certificates = $query->get();

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set headers
            $headers = [
                'เลขที่ใบประกาศ', 'ผู้รับ', 'อีเมล', 'หลักสูตร', 'คะแนน', 
                'วันที่ออก', 'วันที่หมดอายุ', 'สถานะ'
            ];

            foreach ($headers as $colIndex => $header) {
                $sheet->setCellValueByColumnAndRow($colIndex + 1, 1, $header);
            }

            // Add data
            foreach ($certificates as $rowIndex => $certificate) {
                $row = $rowIndex + 2;
                $isExpired = $certificate->expires_at && $certificate->expires_at->isPast();
                $status = $isExpired ? 'หมดอายุ' : 'ใช้งานได้';

                $sheet->setCellValueByColumnAndRow(1, $row, $certificate->certificate_number);
                $sheet->setCellValueByColumnAndRow(2, $row, $certificate->user->name);
                $sheet->setCellValueByColumnAndRow(3, $row, $certificate->user->email);
                $sheet->setCellValueByColumnAndRow(4, $row, $certificate->course->title);
                $sheet->setCellValueByColumnAndRow(5, $row, $certificate->final_score . '%');
                $sheet->setCellValueByColumnAndRow(6, $row, $certificate->issued_at->format('Y-m-d H:i:s'));
                $sheet->setCellValueByColumnAndRow(7, $row, $certificate->expires_at?->format('Y-m-d H:i:s') ?? 'ไม่มีวันหมดอายุ');
                $sheet->setCellValueByColumnAndRow(8, $row, $status);
            }

            // Auto-size columns
            foreach (range(1, count($headers)) as $colIndex) {
                $sheet->getColumnDimensionByColumn($colIndex)->setAutoSize(true);
            }

            $filename = 'certificates_' . date('Y-m-d_H-i-s') . '.' . $format;

            if ($format === 'csv') {
                $writer = new Csv($spreadsheet);
                $content = '';
                ob_start();
                $writer->save('php://output');
                $content = ob_get_clean();
                
                return Response::make($content, 200, [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                ]);
            } else {
                $writer = new Xlsx($spreadsheet);
                $filepath = storage_path('app/temp/' . $filename);
                
                if (!file_exists(dirname($filepath))) {
                    mkdir(dirname($filepath), 0755, true);
                }
                
                $writer->save($filepath);
                
                return response()->download($filepath, $filename)->deleteFileAfterSend();
            }

        } catch (Exception $e) {
            \Log::error('Error exporting certificates', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'เกิดข้อผิดพลาดในการส่งออกข้อมูล: ' . $e->getMessage()]);
        }
    }
}









