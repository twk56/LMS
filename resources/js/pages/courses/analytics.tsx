import { Head } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Users, BookOpen, TrendingUp, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Course {
    id: number;
    title: string;
    description: string;
    creator: {
        name: string;
    };
    category: {
        name: string;
    };
}

interface AnalyticsData {
    total_enrollments: number;
    completed_enrollments: number;
    avg_completion: number;
    total_lessons_started: number;
    total_lessons_completed: number;
}

interface LessonProgress {
    id: number;
    title: string;
    order: number;
    completion_count: number;
}

interface PageProps {
    course: Course;
    analytics: AnalyticsData;
    lessonProgress: LessonProgress[];
}

export default function CourseAnalytics({ course, analytics, lessonProgress }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'หน้าหลัก',
            href: '/dashboard',
        },
        {
            title: 'หลักสูตร',
            href: '/courses',
        },
        {
            title: course.title,
            href: `/courses/${course.id}`,
        },
        {
            title: 'การวิเคราะห์',
            href: `/courses/${course.id}/analytics`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`การวิเคราะห์ - ${course.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={`/courses/${course.id}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            กลับ
                        </a>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                การวิเคราะห์หลักสูตร
                            </h1>
                            <p className="text-base lg:text-lg text-muted-foreground">
                                {course.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Course Info */}
                <Card className="card-modern">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            ข้อมูลหลักสูตร
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">ผู้สร้าง</p>
                                <p className="font-medium">{course.creator.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">หมวดหมู่</p>
                                <p className="font-medium">{course.category.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">คำอธิบาย</p>
                                <p className="font-medium line-clamp-2">{course.description}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 slide-up">
                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                การลงทะเบียนทั้งหมด
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.total_enrollments || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ผู้เรียนที่ลงทะเบียน
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                เสร็จสิ้นแล้ว
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.completed_enrollments || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ผู้เรียนที่เสร็จสิ้น
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                อัตราการเสร็จสิ้น
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.avg_completion || 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                อัตราเฉลี่ย
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                บทเรียนที่เสร็จสิ้น
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.total_lessons_completed || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                จาก {analytics?.total_lessons_started || 0} บทเรียน
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Lesson Progress */}
                {lessonProgress && lessonProgress.length > 0 && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">ความก้าวหน้าของบทเรียน</h2>
                        </div>

                        <Card className="card-modern">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {lessonProgress.map((lesson, index) => {
                                        const completionRate = analytics?.total_enrollments > 0 
                                            ? (lesson.completion_count / analytics.total_enrollments) * 100 
                                            : 0;
                                        
                                        return (
                                            <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">{lesson.order}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm mb-1">
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={completionRate} className="h-2 flex-1" />
                                                        <span className="text-xs text-muted-foreground min-w-[60px]">
                                                            {completionRate.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">
                                                        {lesson.completion_count}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ผู้เรียนเสร็จสิ้น
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
