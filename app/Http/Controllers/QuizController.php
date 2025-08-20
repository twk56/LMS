<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index(Course $course, Lesson $lesson)
    {
        $quiz = $lesson->quiz()->with(['questions.answers'])->first();
        
        if (!$quiz) {
            return redirect()->back()->with('error', 'ไม่พบแบบทดสอบสำหรับบทเรียนนี้');
        }

        $userAttempt = $quiz->getUserAttempt(auth()->id());
        
        return Inertia::render('quizzes/index', [
            'course' => $course,
            'lesson' => $lesson,
            'quiz' => $quiz,
            'userAttempt' => $userAttempt,
        ]);
    }

    public function create(Course $course, Lesson $lesson)
    {
        return Inertia::render('quizzes/create', [
            'course' => $course,
            'lesson' => $lesson,
        ]);
    }

    public function store(Request $request, Course $course, Lesson $lesson)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'nullable|integer|min:1',
            'passing_score' => 'required|integer|min:1|max:100',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,true_false,short_answer',
            'questions.*.points' => 'required|integer|min:1',
            'questions.*.answers' => 'required_if:questions.*.type,multiple_choice,true_false|array',
            'questions.*.answers.*.answer' => 'required|string',
            'questions.*.answers.*.is_correct' => 'required|boolean',
        ]);

        $quiz = $lesson->quiz()->create([
            'title' => $request->title,
            'description' => $request->description,
            'time_limit' => $request->time_limit,
            'passing_score' => $request->passing_score,
        ]);

        foreach ($request->questions as $index => $questionData) {
            $question = $quiz->questions()->create([
                'question' => $questionData['question'],
                'type' => $questionData['type'],
                'points' => $questionData['points'],
                'order' => $index + 1,
            ]);

            if (in_array($questionData['type'], ['multiple_choice', 'true_false']) && isset($questionData['answers'])) {
                foreach ($questionData['answers'] as $answerIndex => $answerData) {
                    $question->answers()->create([
                        'answer' => $answerData['answer'],
                        'is_correct' => $answerData['is_correct'],
                        'order' => $answerIndex + 1,
                    ]);
                }
            }
        }

        return redirect()->route('courses.lessons.show', [$course, $lesson])
            ->with('success', 'สร้างแบบทดสอบสำเร็จ');
    }

    public function show(Course $course, Lesson $lesson, Quiz $quiz)
    {
        $userAttempt = $quiz->getUserAttempt(auth()->id());
        
        if ($userAttempt && $userAttempt->completed_at) {
            return Inertia::render('quizzes/result', [
                'course' => $course,
                'lesson' => $lesson,
                'quiz' => $quiz,
                'attempt' => $userAttempt,
            ]);
        }

        return Inertia::render('quizzes/show', [
            'course' => $course,
            'lesson' => $lesson,
            'quiz' => $quiz->load(['questions.answers']),
            'userAttempt' => $userAttempt,
        ]);
    }

    public function start(Course $course, Lesson $lesson, Quiz $quiz)
    {
        $userAttempt = $quiz->getUserAttempt(auth()->id());
        
        if (!$userAttempt) {
            $userAttempt = $quiz->attempts()->create([
                'user_id' => auth()->id(),
                'started_at' => now(),
            ]);
        }

        return redirect()->route('courses.lessons.quizzes.show', [$course, $lesson, $quiz]);
    }

    public function submit(Request $request, Course $course, Lesson $lesson, Quiz $quiz)
    {
        $userAttempt = $quiz->getUserAttempt(auth()->id());
        
        if (!$userAttempt || $userAttempt->completed_at) {
            return redirect()->back()->with('error', 'ไม่สามารถส่งแบบทดสอบได้');
        }

        $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required',
        ]);

        foreach ($request->answers as $questionId => $answer) {
            $question = QuizQuestion::find($questionId);
            
            if (!$question || $question->quiz_id !== $quiz->id) {
                continue;
            }

            $isCorrect = false;
            $pointsEarned = 0;

            if ($question->type === 'multiple_choice') {
                $correctAnswers = $question->correctAnswers()->pluck('id')->toArray();
                $isCorrect = in_array($answer, $correctAnswers);
                $pointsEarned = $isCorrect ? $question->points : 0;
            } elseif ($question->type === 'true_false') {
                $correctAnswer = $question->correctAnswers()->first();
                $isCorrect = $correctAnswer && $correctAnswer->answer === $answer;
                $pointsEarned = $isCorrect ? $question->points : 0;
            } elseif ($question->type === 'short_answer') {
                // สำหรับ short answer อาจต้องตรวจสอบด้วย AI หรือให้ admin ตรวจสอบ
                $isCorrect = false;
                $pointsEarned = 0;
            }

            $userAttempt->answers()->create([
                'quiz_question_id' => $questionId,
                'answer' => is_array($answer) ? json_encode($answer) : $answer,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
            ]);
        }

        $userAttempt->calculateScore();
        $userAttempt->update(['completed_at' => now()]);

        return redirect()->route('courses.lessons.quizzes.result', [$course, $lesson, $quiz])
            ->with('success', 'ส่งแบบทดสอบสำเร็จ');
    }

    public function result(Course $course, Lesson $lesson, Quiz $quiz)
    {
        $userAttempt = $quiz->getUserAttempt(auth()->id());
        
        if (!$userAttempt || !$userAttempt->completed_at) {
            return redirect()->route('courses.lessons.quizzes.show', [$course, $lesson, $quiz]);
        }

        return Inertia::render('quizzes/result', [
            'course' => $course,
            'lesson' => $lesson,
            'quiz' => $quiz,
            'attempt' => $userAttempt->load(['answers.question.answers']),
        ]);
    }
}
