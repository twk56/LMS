import { Head } from '@inertiajs/react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Activity, Download, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart, AreaChart, ChartContainer } from '@/components/charts';
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
];

interface AnalyticsData {
    total_courses: number;
    total_users: number;
    total_lessons: number;
    total_categories: number;
    total_enrollments: number;
    total_chat_messages: number;
    active_users: number;
    completion_rate: number;
    recent_activities: any[];
    course_stats: any[];
    monthly_courses: any[];
    user_growth: any[];
    category_distribution: any[];
    progress_trend: any[];
    popular_courses: any[];
    user_engagement: any;
    system_health: any;
    learning_insights: any;
}

interface PageProps {
    analytics: AnalyticsData;
}

export default function AnalyticsDashboard({ analytics }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="การวิเคราะห์ - LMS" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Header */}
                <div className="flex items-center justify-between fade-in">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    การวิเคราะห์
                                </h1>
                                <p className="text-base lg:text-lg text-muted-foreground">
                                    ข้อมูลสถิติและความก้าวหน้าของระบบ
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 slide-up">
                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                หลักสูตรทั้งหมด
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.total_courses || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                หลักสูตรในระบบ
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                ผู้ใช้ทั้งหมด
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.total_users || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ผู้ใช้ที่ลงทะเบียน
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                บทเรียนทั้งหมด
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.total_lessons || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                บทเรียนในระบบ
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                อัตราการเสร็จสิ้น
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.completion_rate || 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                อัตราการเสร็จสิ้นรวม
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                การลงทะเบียน
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.total_enrollments || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                การลงทะเบียนทั้งหมด
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-modern group hover:scale-105 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                ผู้ใช้ที่ใช้งาน
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mb-2">
                                {analytics?.active_users || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ผู้ใช้ที่ใช้งาน 30 วันล่าสุด
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                {analytics?.recent_activities && analytics.recent_activities.length > 0 && (
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
                                    {analytics.recent_activities.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                                <Activity className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {activity.description || 'กิจกรรมใหม่'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.user_name || 'ผู้ใช้'}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {activity.created_at ? new Date(activity.created_at).toLocaleDateString('th-TH') : 'เมื่อเร็วๆ นี้'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts Section */}
                <div className="space-y-8 slide-up">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">กราฟการวิเคราะห์</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                รีเฟรช
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                ส่งออก
                            </Button>
                        </div>
                    </div>

                    {/* Monthly Courses Chart */}
                    <ChartContainer
                        title="จำนวนหลักสูตรต่อเดือน"
                        description="แสดงการเติบโตของหลักสูตรในแต่ละเดือน"
                    >
                        <BarChart
                            data={analytics?.monthly_courses || [
                                { month: 'ม.ค.', courses: 12 },
                                { month: 'ก.พ.', courses: 19 },
                                { month: 'มี.ค.', courses: 25 },
                                { month: 'เม.ย.', courses: 22 },
                                { month: 'พ.ค.', courses: 30 },
                                { month: 'มิ.ย.', courses: 28 },
                            ]}
                            dataKey="courses"
                            nameKey="month"
                            color="#3b82f6"
                            height={300}
                        />
                    </ChartContainer>

                    {/* User Growth Chart */}
                    <ChartContainer
                        title="การเติบโตของผู้ใช้"
                        description="แสดงจำนวนผู้ใช้ที่เพิ่มขึ้นในแต่ละเดือน"
                    >
                        <LineChart
                            data={analytics?.user_growth || [
                                { month: 'ม.ค.', users: 100 },
                                { month: 'ก.พ.', users: 150 },
                                { month: 'มี.ค.', users: 200 },
                                { month: 'เม.ย.', users: 250 },
                                { month: 'พ.ค.', users: 300 },
                                { month: 'มิ.ย.', users: 350 },
                            ]}
                            dataKey="users"
                            nameKey="month"
                            color="#10b981"
                            height={300}
                        />
                    </ChartContainer>

                    {/* Category Distribution */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <ChartContainer
                            title="การกระจายหมวดหมู่หลักสูตร"
                            description="แสดงสัดส่วนของหลักสูตรในแต่ละหมวดหมู่"
                        >
                            <PieChart
                                data={analytics?.category_distribution || [
                                    { name: 'Programming', value: 35 },
                                    { name: 'Design', value: 25 },
                                    { name: 'Business', value: 20 },
                                    { name: 'Marketing', value: 20 },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                height={300}
                            />
                        </ChartContainer>

                        <ChartContainer
                            title="แนวโน้มความก้าวหน้า"
                            description="แสดงความก้าวหน้าในการเรียนตามเวลา"
                        >
                            <AreaChart
                                data={analytics?.progress_trend || [
                                    { week: 'สัปดาห์ 1', progress: 20 },
                                    { week: 'สัปดาห์ 2', progress: 35 },
                                    { week: 'สัปดาห์ 3', progress: 50 },
                                    { week: 'สัปดาห์ 4', progress: 65 },
                                    { week: 'สัปดาห์ 5', progress: 80 },
                                    { week: 'สัปดาห์ 6', progress: 90 },
                                ]}
                                dataKey="progress"
                                nameKey="week"
                                color="#8b5cf6"
                                height={300}
                            />
                        </ChartContainer>
                    </div>
                </div>

                {/* Popular Courses */}
                {analytics?.popular_courses && analytics.popular_courses.length > 0 && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <Award className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">หลักสูตรยอดนิยม</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {analytics.popular_courses.map((course, index) => (
                                <Card key={index} className="card-modern scale-in group hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors">
                                                {course.title || 'หลักสูตร'}
                                            </CardTitle>
                                            <Badge 
                                                variant={course.status === 'published' ? 'default' : 'secondary'}
                                                className={`${
                                                    course.status === 'published' 
                                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                                        : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                                } font-medium`}
                                            >
                                                {course.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-blue-500" />
                                                <span className="font-medium">{course.enrollments || 0} ผู้เรียน</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {course.category || 'ไม่มีหมวดหมู่'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* System Health */}
                {analytics?.system_health && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Activity className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">สุขภาพระบบ</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="text-lg">หลักสูตร</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">ทั้งหมด</span>
                                        <span className="font-semibold">{analytics.system_health.courses?.total || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">เผยแพร่</span>
                                        <span className="font-semibold text-green-600">{analytics.system_health.courses?.published || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">ร่าง</span>
                                        <span className="font-semibold text-blue-600">{analytics.system_health.courses?.draft || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">อัตราการเผยแพร่</span>
                                        <span className="font-semibold">{analytics.system_health.courses?.publish_rate || 0}%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="text-lg">บทเรียน</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">ทั้งหมด</span>
                                        <span className="font-semibold">{analytics.system_health.lessons?.total || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">เผยแพร่</span>
                                        <span className="font-semibold text-green-600">{analytics.system_health.lessons?.published || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">อัตราการเผยแพร่</span>
                                        <span className="font-semibold">{analytics.system_health.lessons?.publish_rate || 0}%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="text-lg">ผู้ใช้</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">ทั้งหมด</span>
                                        <span className="font-semibold">{analytics.system_health.users?.total || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Admin</span>
                                        <span className="font-semibold text-purple-600">{analytics.system_health.users?.admin || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Student</span>
                                        <span className="font-semibold text-blue-600">{analytics.system_health.users?.student || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">อัตรา Admin</span>
                                        <span className="font-semibold">{analytics.system_health.users?.admin_ratio || 0}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Learning Insights */}
                {analytics?.learning_insights && (
                    <div className="space-y-6 slide-up">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">ข้อมูลเชิงลึกการเรียนรู้</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="text-lg">ข้อมูลการเสร็จสิ้น</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">การลงทะเบียนทั้งหมด</span>
                                        <span className="font-semibold">{analytics.learning_insights.completion_insights?.total_enrollments || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">บทเรียนที่เสร็จสิ้น</span>
                                        <span className="font-semibold text-green-600">{analytics.learning_insights.completion_insights?.completed_lessons || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">อัตราการเสร็จสิ้น</span>
                                        <span className="font-semibold">{analytics.learning_insights.completion_insights?.completion_rate || 0}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">เวลาสำเร็จเฉลี่ย</span>
                                        <span className="font-semibold">{analytics.learning_insights.completion_insights?.avg_completion_time_hours || 0} ชม.</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="card-modern">
                                <CardHeader>
                                    <CardTitle className="text-lg">ผู้ใช้ที่ใช้งานมากที่สุด</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analytics.learning_insights.most_active_users?.map((user: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground ml-2">({user.role})</span>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-600">{user.messages} ข้อความ</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
