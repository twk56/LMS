import { Head } from '@inertiajs/react';
import { ArrowLeft, Users, BookOpen, Clock, Award, TrendingUp, Target } from 'lucide-react';

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
        title: 'ความก้าวหน้าผู้ใช้',
        href: '/analytics/users',
    },
];

interface PageProps {
    user: any;
    progress: {
        overall_progress: number;
        courses_completed: number;
        total_courses: number;
        time_spent: number;
        average_score: number;
        learning_streak: number;
        course_progress: any[];
        weekly_activity: any[];
        skill_development: any[];
        achievements: any[];
    };
}

export default function UserProgress({ user, progress }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ความก้าวหน้าผู้ใช้ - LMS" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/analytics">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            กลับ
                        </a>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ความก้าวหน้าผู้ใช้
                            </h1>
                            <p className="text-base lg:text-lg text-muted-foreground">
                                {user?.name || 'ผู้ใช้'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Progress Overview */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                ความก้าวหน้าทั้งหมด
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {progress?.overall_progress || 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ความก้าวหน้าโดยรวม
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                หลักสูตรที่เสร็จสิ้น
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {progress?.courses_completed || 0}/{progress?.total_courses || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                หลักสูตรที่เสร็จสิ้น
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                เวลาเรียนรวม
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {progress?.time_spent || 0}h
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ชั่วโมงเรียนรวม
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
                                {progress?.average_score || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                คะแนนจาก 100
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="space-y-8">
                    {/* Overall Progress */}
                    <ChartContainer
                        title="ความก้าวหน้าโดยรวม"
                        description="แสดงความก้าวหน้าในหลักสูตรต่างๆ"
                    >
                        <ProgressChart
                            data={[{ progress: progress?.overall_progress || 0 }]}
                            dataKey="progress"
                            nameKey="progress"
                            color="#3b82f6"
                            height={200}
                        />
                    </ChartContainer>

                    {/* Course Progress */}
                    <ChartContainer
                        title="ความก้าวหน้าในแต่ละหลักสูตร"
                        description="แสดงความก้าวหน้าในหลักสูตรที่กำลังเรียน"
                    >
                        <BarChart
                            data={progress?.course_progress || [
                                { course: 'React Basics', progress: 85 },
                                { course: 'JavaScript Advanced', progress: 60 },
                                { course: 'Node.js', progress: 40 },
                                { course: 'Database Design', progress: 25 },
                            ]}
                            dataKey="progress"
                            nameKey="course"
                            color="#10b981"
                            height={300}
                        />
                    </ChartContainer>

                    {/* Weekly Activity */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <ChartContainer
                            title="กิจกรรมรายสัปดาห์"
                            description="แสดงเวลาที่ใช้ในการเรียนในแต่ละสัปดาห์"
                        >
                            <LineChart
                                data={progress?.weekly_activity || [
                                    { week: 'สัปดาห์ 1', hours: 8 },
                                    { week: 'สัปดาห์ 2', hours: 12 },
                                    { week: 'สัปดาห์ 3', hours: 15 },
                                    { week: 'สัปดาห์ 4', hours: 10 },
                                    { week: 'สัปดาห์ 5', hours: 18 },
                                    { week: 'สัปดาห์ 6', hours: 14 },
                                ]}
                                dataKey="hours"
                                nameKey="week"
                                color="#8b5cf6"
                                height={300}
                            />
                        </ChartContainer>

                        <ChartContainer
                            title="การพัฒนาทักษะ"
                            description="แสดงระดับทักษะในแต่ละด้าน"
                        >
                            <PieChart
                                data={progress?.skill_development || [
                                    { skill: 'Programming', level: 80 },
                                    { skill: 'Design', level: 60 },
                                    { skill: 'Database', level: 40 },
                                    { skill: 'DevOps', level: 20 },
                                ]}
                                dataKey="level"
                                nameKey="skill"
                                height={300}
                            />
                        </ChartContainer>
                    </div>

                    {/* Achievements */}
                    {progress?.achievements && progress.achievements.length > 0 && (
                        <ChartContainer
                            title="ความสำเร็จที่ได้รับ"
                            description="แสดงความสำเร็จและรางวัลที่ได้รับ"
                        >
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {progress.achievements.map((achievement, index) => (
                                    <Card key={index} className="card-modern">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                                                    <Award className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">
                                                        {achievement.title || 'ความสำเร็จ'}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {achievement.description || 'คำอธิบาย'}
                                                    </p>
                                                    <Badge variant="secondary" className="mt-1 text-xs">
                                                        {achievement.date || 'เมื่อเร็วๆ นี้'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ChartContainer>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
