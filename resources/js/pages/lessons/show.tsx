import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Edit, PlayCircle, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Lesson {
    id: number;
    title: string;
    content: string;
    content_type: string;
    order: number;
    status: 'draft' | 'published';
    youtube_url?: string;
}

interface Course {
    id: number;
    title: string;
}

interface UserProgress {
    id: number;
    status: 'not_started' | 'in_progress' | 'completed';
    started_at: string | null;
    completed_at: string | null;
}

interface LessonShowProps {
    lesson: Lesson;
    course: Course;
    nextLesson: Lesson | null;
    previousLesson: Lesson | null;
    isAdmin: boolean;
    userProgress: UserProgress | null;
}

export default function LessonShow({ lesson, course, nextLesson, previousLesson, isAdmin, userProgress }: LessonShowProps) {
    const isCompleted = userProgress?.status === 'completed';
    const isInProgress = userProgress?.status === 'in_progress';

    const extractYouTubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${lesson.title} - ${course.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`/courses/${course.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับไปหลักสูตร
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{lesson.title}</h1>
                            <p className="text-muted-foreground">
                                บทเรียนที่ {lesson.order} ในหลักสูตร "{course.title}"
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <Button variant="outline" asChild>
                                <a href={`/lessons/${lesson.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    แก้ไข
                                </a>
                            </Button>
                        )}
                        {!isAdmin && lesson.status === 'published' && !isCompleted && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                router.post(`/courses/${course.id}/lessons/${lesson.id}/complete`, {}, {
                                    onSuccess: () => {
                                        // Refresh the page to show updated progress
                                        window.location.reload();
                                    },
                                    onError: (errors: any) => {
                                        console.error('Error completing lesson:', errors);
                                        alert('เกิดข้อผิดพลาดในการบันทึกการเสร็จสิ้นบทเรียน');
                                    }
                                });
                            }}>
                                <Button type="submit">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    เสร็จสิ้นบทเรียน
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Progress Status */}
                {!isAdmin && userProgress && (
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                {isCompleted ? (
                                    <>
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                บทเรียนเสร็จสิ้นแล้ว
                                            </p>
                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                เสร็จสิ้นเมื่อ {new Date(userProgress.completed_at!).toLocaleDateString('th-TH')}
                                            </p>
                                        </div>
                                    </>
                                ) : isInProgress ? (
                                    <>
                                        <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="font-medium text-blue-800 dark:text-blue-200">
                                                กำลังเรียนอยู่
                                            </p>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                                เริ่มเรียนเมื่อ {new Date(userProgress.started_at!).toLocaleDateString('th-TH')}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        <p className="font-medium text-gray-800 dark:text-gray-200">
                                            ยังไม่ได้เริ่มเรียน
                                        </p>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Lesson Content */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="md:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>เนื้อหาบทเรียน</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* YouTube Video */}
                                {lesson.youtube_url && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">วิดีโอ YouTube</h3>
                                        <div className="aspect-video w-full max-w-4xl">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(lesson.youtube_url)}`}
                                                title="YouTube video"
                                                className="w-full h-full rounded-lg border"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Lesson Content */}
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    {lesson.content_type === 'rich_text' ? (
                                        <div 
                                            className="rich-text-content"
                                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                                        />
                                    ) : (
                                        <div 
                                            className="whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br>') }}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Lesson Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">ข้อมูลบทเรียน</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">ลำดับ</span>
                                        <span className="font-medium">{lesson.order}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">สถานะ</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            lesson.status === 'published' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {lesson.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                        </span>
                                    </div>
                                    {!isAdmin && userProgress && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">ความคืบหน้า</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                isCompleted
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : isInProgress
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                            }`}>
                                                {isCompleted ? 'เสร็จสิ้น' : isInProgress ? 'กำลังเรียน' : 'ยังไม่เริ่ม'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">นำทาง</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {previousLesson && (
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <a href={`/lessons/${previousLesson.id}`}>
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                บทเรียนก่อนหน้า
                                            </a>
                                        </Button>
                                    )}
                                    {nextLesson && (
                                        <Button className="w-full justify-start" asChild>
                                            <a href={`/lessons/${nextLesson.id}`}>
                                                บทเรียนถัดไป
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <a href={`/lessons/${lesson.id}/files`}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            ไฟล์ในบทเรียน
                                        </a>
                                    </Button>
                                    <Button variant="ghost" className="w-full" asChild>
                                        <a href={`/courses/${course.id}`}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            กลับไปหลักสูตร
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                    <div>
                        {previousLesson && (
                            <Button variant="outline" asChild>
                                <a href={`/lessons/${previousLesson.id}`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    บทเรียนก่อนหน้า: {previousLesson.title}
                                </a>
                            </Button>
                        )}
                    </div>
                    <div>
                        {nextLesson && (
                            <Button asChild>
                                <a href={`/lessons/${nextLesson.id}`}>
                                    บทเรียนถัดไป: {nextLesson.title}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 