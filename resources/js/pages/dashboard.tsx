import { Head } from '@inertiajs/react';
import { BookOpen, Plus, Users, Calendar, Award, BarChart3, TrendingUp, Clock, Sparkles, Target, Zap, Brain, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type DashboardProps } from '@/types/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
];


export default function Dashboard({ user, isAdmin, stats, enrolledCourses, recentCompletions, upcomingLessons, recentActivities, courseStats, userStats }: DashboardProps) {
    const totalLessons = stats.total_lessons || 0;
    const totalStudents = isAdmin ? stats.total_users || 0 : 0;
    const publishedCourses = stats.total_courses || 0;
    const completionRate = stats.completion_rate || 0;

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
                    <Card key="courses-stat" className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {isAdmin ? 'หลักสูตรทั้งหมด' : 'หลักสูตรที่ลงทะเบียน'}
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {isAdmin ? (stats.total_courses || 0) : (stats.enrolled_courses || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                                {isAdmin ? 'หลักสูตรที่คุณสร้าง' : 'หลักสูตรที่คุณลงทะเบียน'}
                            </p>
                            <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-xs text-green-600 font-medium">
                                    {isAdmin ? '+12% จากเดือนที่แล้ว' : `${stats.course_completion_rate || 0}% เสร็จสิ้น`}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card key="lessons-stat" className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">บทเรียนทั้งหมด</CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">{totalLessons}</div>
                            <p className="text-xs text-muted-foreground mb-3">
                                {isAdmin ? 'บทเรียนในระบบ' : 'บทเรียนที่เรียน'}
                            </p>
                            <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-xs text-green-600 font-medium">
                                    {isAdmin ? `${stats.completed_lessons || 0} เสร็จสิ้น` : `${stats.lesson_completion_rate || 0}% เสร็จสิ้น`}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card key="users-stat" className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {isAdmin ? 'ผู้เรียนทั้งหมด' : 'หลักสูตรที่เสร็จสิ้น'}
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {isAdmin ? totalStudents : (stats.completed_courses || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                                {isAdmin ? 'ผู้เรียนที่ลงทะเบียน' : 'หลักสูตรที่เรียนจบ'}
                            </p>
                            <div className="flex items-center">
                                <Award className="h-4 w-4 text-yellow-500 mr-2" />
                                <span className="text-xs text-yellow-600 font-medium">
                                    {isAdmin ? `${stats.completed_enrollments || 0} เสร็จสิ้น` : 'ใบรับรองพร้อมใช้งาน'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card key="completion-stat" className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">อัตราการเสร็จสิ้น</CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">{completionRate}%</div>
                            <p className="text-xs text-muted-foreground mb-3">
                                {isAdmin ? 'อัตราการเสร็จสิ้นรวม' : 'ความก้าวหน้าของคุณ'}
                            </p>
                            <Progress value={completionRate} className="h-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Analytics Section */}
                {isAdmin && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">การวิเคราะห์</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <Card key="total-users" className="card-modern">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        ผู้ใช้ทั้งหมด
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{userStats?.total_users || stats.total_users || 0}</div>
                                    <p className="text-xs text-muted-foreground">ผู้ใช้ที่ลงทะเบียนในระบบ</p>
                                    {userStats?.new_users_this_month && (
                                        <p className="text-xs text-green-600 mt-1">
                                            +{userStats.new_users_this_month} คนในเดือนนี้
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card key="enrollments" className="card-modern">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        การลงทะเบียน
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.completed_enrollments || 0}</div>
                                    <p className="text-xs text-muted-foreground">การลงทะเบียนที่ใช้งานอยู่</p>
                                </CardContent>
                            </Card>

                            <Card key="completed-courses" className="card-modern">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        หลักสูตรเสร็จสิ้น
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.completed_courses || 0}</div>
                                    <p className="text-xs text-muted-foreground">หลักสูตรที่ผู้เรียนเสร็จสิ้น</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Statistics */}
                        {userStats && (
                            <div className="grid gap-6 md:grid-cols-4">
                                <Card key="admin-users" className="card-modern">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            ผู้ดูแลระบบ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600">{userStats.admin_users}</div>
                                    </CardContent>
                                </Card>

                                <Card key="student-users" className="card-modern">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            ผู้เรียน
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{userStats.student_users}</div>
                                    </CardContent>
                                </Card>

                                <Card key="active-users" className="card-modern">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            ผู้ใช้ที่ใช้งานล่าสุด
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-purple-600">{userStats.active_users}</div>
                                        <p className="text-xs text-muted-foreground">30 วันที่ผ่านมา</p>
                                    </CardContent>
                                </Card>

                                <Card key="new-users" className="card-modern">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            ผู้ใช้ใหม่เดือนนี้
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-600">{userStats.new_users_this_month}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Recent Activities */}
                        {recentActivities && recentActivities.length > 0 && (
                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        กิจกรรมล่าสุด
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentActivities.slice(0, 5).map((activity, index) => (
                                            <div key={`activity-${index}-${activity.course_title}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {activity.user_name} เสร็จสิ้น "{activity.lesson_title}"
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ในหลักสูตร {activity.course_title}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(activity.created_at).toLocaleDateString('th-TH')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Course Statistics */}
                        {courseStats && courseStats.length > 0 && (
                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        หลักสูตรล่าสุด
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {courseStats.slice(0, 5).map((course) => (
                                            <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <div>
                                                    <p className="font-medium">{course.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {course.category_name || 'ไม่มีหมวดหมู่'} • {course.students_count} ผู้เรียน
                                                    </p>
                                                </div>
                                                <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                                    {course.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Student Progress Section */}
                {!isAdmin && enrolledCourses && enrolledCourses.length > 0 && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">ความก้าวหน้าของคุณ</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {enrolledCourses.map((course, index) => (
                                <Card key={`course-${course.id}-${index}`} className="card-modern scale-in group hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors">
                                                {course.title}
                                            </CardTitle>
                                            <Badge 
                                                variant={course.is_completed ? 'default' : 'secondary'}
                                                className={`${
                                                    course.is_completed 
                                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                                        : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                                } font-medium`}
                                            >
                                                {course.is_completed ? 'เสร็จสิ้น' : 'กำลังเรียน'}
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
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>ความก้าวหน้า</span>
                                                <span className="font-medium">{course.progress_percentage || 0}%</span>
                                            </div>
                                            <Progress value={course.progress_percentage || 0} className="h-2" />
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
                    </div>
                )}

                {/* Recent Activity Section */}
                {recentCompletions && recentCompletions.length > 0 && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <Activity className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">กิจกรรมล่าสุด</h2>
                        </div>

                        <Card className="card-modern">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {recentCompletions.slice(0, 5).map((completion, index) => (
                                        <div key={completion.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    เสร็จสิ้นบทเรียน "{completion.lesson?.title}"
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    ในหลักสูตร {completion.lesson?.course?.title}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {completion.completed_at ? new Date(completion.completed_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Upcoming Lessons Section */}
                {upcomingLessons && upcomingLessons.length > 0 && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                <Clock className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">บทเรียนถัดไป</h2>
                        </div>

                        <Card className="card-modern">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {upcomingLessons.slice(0, 5).map((lesson, index) => (
                                        <div key={`lesson-${index}-${lesson.lesson_title}`} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {lesson.lesson_title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    ในหลักสูตร {lesson.course_title}
                                                </p>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                เริ่มเรียน
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
