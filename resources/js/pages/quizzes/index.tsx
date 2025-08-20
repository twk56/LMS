import { Head } from '@inertiajs/react';
import { BookOpen, Clock, Target, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: 'หลักสูตร',
        href: '/courses',
    },
];

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    time_limit: number | null;
    passing_score: number;
    is_active: boolean;
    questions: any[];
}

interface Lesson {
    id: number;
    title: string;
    course: {
        id: number;
        title: string;
    };
}

interface QuizIndexProps {
    course: any;
    lesson: Lesson;
    quiz: Quiz;
    userAttempt: any;
}

export default function QuizIndex({ course, lesson, quiz, userAttempt }: QuizIndexProps) {
    const isCompleted = userAttempt && userAttempt.completed_at;
    const canTakeQuiz = !isCompleted && quiz.is_active;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`แบบทดสอบ - ${quiz.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{quiz.title}</h1>
                        <p className="text-muted-foreground">
                            แบบทดสอบสำหรับบทเรียน: {lesson.title}
                        </p>
                    </div>
                    <Button variant="ghost" asChild>
                        <a href={route('courses.lessons.show', [course.id, lesson.id])}>
                            กลับไปบทเรียน
                        </a>
                    </Button>
                </div>

                {/* Quiz Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        {/* Quiz Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>รายละเอียดแบบทดสอบ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-2">คำอธิบาย</h3>
                                        <p className="text-muted-foreground">
                                            {quiz.description || 'ไม่มีคำอธิบาย'}
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                {quiz.questions.length} คำถาม
                                            </span>
                                        </div>
                                        
                                        {quiz.time_limit && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {quiz.time_limit} นาที
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                ผ่านที่ {quiz.passing_score}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>คำแนะนำ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                        <p>อ่านคำถามให้ละเอียดก่อนตอบ</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                        <p>คุณสามารถกลับไปแก้ไขคำตอบได้ก่อนส่ง</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                        <p>แบบทดสอบจะถูกส่งอัตโนมัติเมื่อหมดเวลา</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                        <p>คุณสามารถทำแบบทดสอบได้เพียงครั้งเดียว</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Card */}
                    <div className="space-y-6">
                        {isCompleted ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        ผลการทดสอบ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold mb-2">
                                                {userAttempt.percentage}%
                                            </div>
                                            <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                                                userAttempt.passed 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {userAttempt.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>คะแนนที่ได้:</span>
                                                <span>{userAttempt.score} / {userAttempt.total_points}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>คะแนนขั้นต่ำ:</span>
                                                <span>{quiz.passing_score}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>เวลาที่ใช้:</span>
                                                <span>
                                                    {userAttempt.started_at && userAttempt.completed_at 
                                                        ? Math.round((new Date(userAttempt.completed_at).getTime() - new Date(userAttempt.started_at).getTime()) / 1000 / 60)
                                                        : '-'
                                                    } นาที
                                                </span>
                                            </div>
                                        </div>

                                        <Button asChild className="w-full">
                                            <a href={route('courses.lessons.quizzes.result', [course.id, lesson.id, quiz.id])}>
                                                ดูผลการทดสอบ
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>เริ่มทำแบบทดสอบ</CardTitle>
                                    <CardDescription>
                                        พร้อมแล้วหรือยัง? คลิกปุ่มด้านล่างเพื่อเริ่มทำแบบทดสอบ
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {!canTakeQuiz && (
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm text-yellow-800">
                                                    แบบทดสอบนี้ไม่พร้อมใช้งาน
                                                </p>
                                            </div>
                                        )}
                                        
                                        <Button 
                                            asChild 
                                            className="w-full" 
                                            disabled={!canTakeQuiz}
                                        >
                                            <a href={route('courses.lessons.quizzes.start', [course.id, lesson.id, quiz.id])}>
                                                เริ่มทำแบบทดสอบ
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 