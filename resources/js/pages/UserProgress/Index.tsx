import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    category: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
    enrolled_at: string;
}

interface Statistics {
    total_courses: number;
    completed_courses: number;
    in_progress_courses: number;
    average_progress: number;
}

interface UserProgressIndexProps {
    courses: Course[];
    statistics: Statistics;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    error?: string;
}

export default function UserProgressIndex({ courses, statistics, user, error }: UserProgressIndexProps) {
    if (error) {
        return (
            <AppLayout>
                <Head title="ความก้าวหน้า" />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="ความก้าวหน้า" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">ความก้าวหน้าในการเรียน</h1>
                    <p className="text-gray-600">ติดตามความก้าวหน้าและผลการเรียนของคุณ</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">หลักสูตรทั้งหมด</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_courses}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">หลักสูตรที่เสร็จสิ้น</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.completed_courses}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">กำลังเรียน</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{statistics.in_progress_courses}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ความก้าวหน้าเฉลี่ย</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{statistics.average_progress}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses List */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">หลักสูตรที่ลงทะเบียน</h2>
                    
                    {courses.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีหลักสูตร</h3>
                                <p className="text-gray-600">คุณยังไม่ได้ลงทะเบียนหลักสูตรใดๆ</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {courses.map((course) => (
                                <Card key={course.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{course.title}</CardTitle>
                                                <CardDescription className="mt-1">{course.description}</CardDescription>
                                            </div>
                                            <Badge variant={course.progress_percentage === 100 ? "default" : "secondary"}>
                                                {course.progress_percentage === 100 ? 'เสร็จสิ้น' : 'กำลังเรียน'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                    <span>ความก้าวหน้า</span>
                                                    <span>{course.completed_lessons}/{course.total_lessons} บทเรียน</span>
                                                </div>
                                                <Progress value={course.progress_percentage} className="h-2" />
                                                <div className="text-right text-sm text-gray-600 mt-1">
                                                    {course.progress_percentage}%
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>หมวดหมู่: {course.category || 'ไม่ระบุ'}</span>
                                                <span>ลงทะเบียน: {new Date(course.enrolled_at).toLocaleDateString('th-TH')}</span>
                                            </div>
                                        </div>
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
