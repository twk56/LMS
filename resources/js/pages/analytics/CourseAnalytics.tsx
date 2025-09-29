import { Head } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Users, Clock, Award, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart, PieChart, ProgressChart, ChartContainer } from '@/components/charts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: 'การวิเคราะห์',
        href: '/analytics',
    },
    {
        title: 'การวิเคราะห์หลักสูตร',
        href: '/analytics/courses',
    },
];

interface PageProps {
    course: any;
    analytics: {
        enrollment_stats: any[];
        completion_rates: any[];
        lesson_progress: any[];
        student_engagement: any[];
        time_spent: any[];
        quiz_scores: any[];
    };
}

export default function CourseAnalytics({ course, analytics }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="การวิเคราะห์หลักสูตร - LMS" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/analytics">
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
                                {course?.title || 'หลักสูตร'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Course Overview Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                ผู้เรียนทั้งหมด
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.enrollment_stats?.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ผู้เรียนที่ลงทะเบียน
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                อัตราการเสร็จสิ้น
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.completion_rates?.[0]?.rate || 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ผู้เรียนที่เสร็จสิ้น
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                เวลาเรียนเฉลี่ย
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.time_spent?.[0]?.average || 0}h
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ชั่วโมงต่อคน
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                คะแนนเฉลี่ย
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.quiz_scores?.[0]?.average || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                คะแนนจาก 100
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="space-y-8">
                    {/* Enrollment Over Time */}
                    <ChartContainer
                        title="การเติบโตของผู้เรียน"
                        description="แสดงจำนวนผู้เรียนที่เพิ่มขึ้นตามเวลา"
                    >
                        <LineChart
                            data={analytics?.enrollment_stats || [
                                { week: 'สัปดาห์ 1', enrollments: 5 },
                                { week: 'สัปดาห์ 2', enrollments: 12 },
                                { week: 'สัปดาห์ 3', enrollments: 18 },
                                { week: 'สัปดาห์ 4', enrollments: 25 },
                                { week: 'สัปดาห์ 5', enrollments: 32 },
                                { week: 'สัปดาห์ 6', enrollments: 40 },
                            ]}
                            dataKey="enrollments"
                            nameKey="week"
                            color="#3b82f6"
                            height={300}
                        />
                    </ChartContainer>

                    {/* Lesson Progress */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <ChartContainer
                            title="ความก้าวหน้าในบทเรียน"
                            description="แสดงความก้าวหน้าในแต่ละบทเรียน"
                        >
                            <BarChart
                                data={analytics?.lesson_progress || [
                                    { lesson: 'บทที่ 1', progress: 95 },
                                    { lesson: 'บทที่ 2', progress: 87 },
                                    { lesson: 'บทที่ 3', progress: 78 },
                                    { lesson: 'บทที่ 4', progress: 65 },
                                    { lesson: 'บทที่ 5', progress: 45 },
                                ]}
                                dataKey="progress"
                                nameKey="lesson"
                                color="#10b981"
                                height={300}
                            />
                        </ChartContainer>

                        <ChartContainer
                            title="การกระจายคะแนน"
                            description="แสดงการกระจายคะแนนของผู้เรียน"
                        >
                            <PieChart
                                data={analytics?.quiz_scores || [
                                    { range: '90-100', count: 15 },
                                    { range: '80-89', count: 20 },
                                    { range: '70-79', count: 12 },
                                    { range: '60-69', count: 8 },
                                    { range: 'ต่ำกว่า 60', count: 5 },
                                ]}
                                dataKey="count"
                                nameKey="range"
                                height={300}
                            />
                        </ChartContainer>
                    </div>

                    {/* Student Engagement */}
                    <ChartContainer
                        title="ความผูกพันของผู้เรียน"
                        description="แสดงระดับความผูกพันตามเวลา"
                    >
                        <LineChart
                            data={analytics?.student_engagement || [
                                { day: 'จ.', engagement: 7.2 },
                                { day: 'อ.', engagement: 8.1 },
                                { day: 'พ.', engagement: 7.8 },
                                { day: 'พฤ.', engagement: 8.5 },
                                { day: 'ศ.', engagement: 7.9 },
                                { day: 'ส.', engagement: 6.8 },
                                { day: 'อา.', engagement: 5.2 },
                            ]}
                            dataKey="engagement"
                            nameKey="day"
                            color="#8b5cf6"
                            height={300}
                        />
                    </ChartContainer>
                </div>
            </div>
        </AppLayout>
    );
}
