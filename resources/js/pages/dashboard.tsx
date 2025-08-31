import { Head } from '@inertiajs/react';
import { BookOpen, Plus, Users, Calendar, Award, BarChart3, TrendingUp, Clock, Sparkles, Target, Zap, Brain, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
];

interface DashboardProps {
    courses: any[];
    isAdmin: boolean;
    analytics?: {
        total_users?: number;
        total_lessons?: number;
        total_quizzes?: number;
        active_enrollments?: number;
        completed_courses?: number;
        system_health?: {
            memory_usage: number;
            disk_usage: number;
            response_time: number;
        };
    };
}

export default function Dashboard({ courses, isAdmin, analytics }: DashboardProps) {
    const totalLessons = courses.reduce((total, course) => total + (course.lessons?.length || 0), 0);
    const totalStudents = isAdmin ? courses.reduce((total, course) => total + (course.students?.length || 0), 0) : 0;
    const publishedCourses = courses.filter(course => course.status === 'published').length;
    const completionRate = courses.length > 0 ? Math.round((publishedCourses / courses.length) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="หน้าหลัก - LMS" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between fade-in">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    ยินดีต้อนรับ
                                </h1>
                                <p className="text-base lg:text-lg text-muted-foreground">
                                    {isAdmin ? 'จัดการหลักสูตรและบทเรียนของคุณ' : 'เริ่มต้นการเรียนรู้ของคุณ'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <Button asChild className="button-primary scale-in shadow-lg hover:shadow-xl">
                            <a href="/courses/create">
                                <Plus className="mr-2 h-5 w-5" />
                                สร้างหลักสูตรใหม่
                            </a>
                        </Button>
                    )}
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 slide-up">
                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">หลักสูตรทั้งหมด</CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">{courses.length}</div>
                            <p className="text-xs text-muted-foreground mb-3">
                                {isAdmin ? 'หลักสูตรที่คุณสร้าง' : 'หลักสูตรที่คุณลงทะเบียน'}
                            </p>
                            <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-xs text-green-600 font-medium">+12% จากเดือนที่แล้ว</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">บทเรียนทั้งหมด</CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">{totalLessons}</div>
                            <p className="text-xs text-muted-foreground mb-3">บทเรียนในหลักสูตรทั้งหมด</p>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                                <span className="text-xs text-blue-600 font-medium">เฉลี่ย 5 บทเรียนต่อหลักสูตร</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">หลักสูตรที่เผยแพร่</CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">{publishedCourses}</div>
                            <p className="text-xs text-muted-foreground mb-3">หลักสูตรที่พร้อมใช้งาน</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">อัตราการเผยแพร่</span>
                                    <span className="text-xs font-medium text-green-600">{completionRate}%</span>
                                </div>
                                <Progress value={completionRate} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">ผู้เรียน</CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {isAdmin ? totalStudents : '-'}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                                {isAdmin ? 'ผู้เรียนทั้งหมด' : 'ไม่สามารถดูได้'}
                            </p>
                            {isAdmin && (
                                <div className="flex items-center">
                                    <BarChart3 className="h-4 w-4 text-orange-500 mr-2" />
                                    <span className="text-xs text-orange-600 font-medium">+8% จากสัปดาห์ที่แล้ว</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Analytics Section */}
                {isAdmin && analytics && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">สถิติระบบ</h2>
                        </div>
                        
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="card-modern">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.total_users || 0}</div>
                                    <p className="text-xs text-muted-foreground">ผู้ใช้ที่ลงทะเบียนในระบบ</p>
                                </CardContent>
                            </Card>

                            <Card className="card-modern">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">การลงทะเบียน</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.active_enrollments || 0}</div>
                                    <p className="text-xs text-muted-foreground">การลงทะเบียนที่ใช้งานอยู่</p>
                                </CardContent>
                            </Card>

                            <Card className="card-modern">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">หลักสูตรที่เสร็จสิ้น</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analytics.completed_courses || 0}</div>
                                    <p className="text-xs text-muted-foreground">หลักสูตรที่ผู้เรียนเสร็จสิ้น</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Health */}
                        {analytics.system_health && (
                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        สถานะระบบ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">หน่วยความจำ</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {analytics.system_health.memory_usage}%
                                                </span>
                                            </div>
                                            <Progress 
                                                value={analytics.system_health.memory_usage} 
                                                className="h-2"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">พื้นที่จัดเก็บ</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {analytics.system_health.disk_usage}%
                                                </span>
                                            </div>
                                            <Progress 
                                                value={analytics.system_health.disk_usage} 
                                                className="h-2"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">เวลาตอบสนอง</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {analytics.system_health.response_time}ms
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full">
                                                <div 
                                                    className={`h-2 rounded-full ${
                                                        analytics.system_health.response_time < 200 
                                                            ? 'bg-green-500' 
                                                            : analytics.system_health.response_time < 500 
                                                                ? 'bg-yellow-500' 
                                                                : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${Math.min(analytics.system_health.response_time / 10, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Enhanced Courses Section */}
                <div className="space-y-6 slide-up">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Target className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {isAdmin ? 'หลักสูตรของคุณ' : 'หลักสูตรที่ลงทะเบียน'}
                            </h2>
                        </div>
                        <Badge className="badge-modern px-4 py-2">
                            <Zap className="h-3 w-3 mr-1" />
                            {courses.length} หลักสูตร
                        </Badge>
                    </div>
                    
                    {courses.length === 0 ? (
                        <Card className="card-modern">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                    <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                                    {isAdmin ? 'ยังไม่มีหลักสูตร' : 'ยังไม่ได้ลงทะเบียนหลักสูตร'}
                                </h3>
                                <p className="text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
                                    {isAdmin 
                                        ? 'เริ่มต้นสร้างหลักสูตรแรกของคุณเพื่อแบ่งปันความรู้และประสบการณ์กับผู้เรียนทั่วโลก'
                                        : 'ค้นหาหลักสูตรที่น่าสนใจและเริ่มต้นการเรียนรู้ของคุณในวันนี้'
                                    }
                                </p>
                                {isAdmin ? (
                                    <Button asChild className="button-primary shadow-lg hover:shadow-xl">
                                        <a href="/courses/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            สร้างหลักสูตรแรก
                                        </a>
                                    </Button>
                                ) : (
                                    <Button asChild className="button-primary shadow-lg hover:shadow-xl">
                                        <a href="/courses">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            ดูหลักสูตรทั้งหมด
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course, index) => (
                                <Card key={course.id} className="card-modern scale-in group hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors">
                                                {course.title}
                                            </CardTitle>
                                            <Badge 
                                                variant={course.status === 'published' ? 'default' : 'secondary'}
                                                className={`${
                                                    course.status === 'published' 
                                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                                                } font-medium`}
                                            >
                                                {course.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                            </Badge>
                                        </div>
                                        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                                            {course.description || 'ไม่มีคำอธิบาย'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                                <span className="font-medium">{course.lessons?.length || 0} บทเรียน</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-purple-500" />
                                                <span className="font-medium">{course.students?.length || 0} ผู้เรียน</span>
                                            </div>
                                        </div>
                                        <Button asChild className="w-full button-primary shadow-md hover:shadow-lg">
                                            <a href={`/courses/${course.id}`}>
                                                ดูหลักสูตร
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
