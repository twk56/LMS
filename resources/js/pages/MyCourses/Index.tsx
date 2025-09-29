import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Clock, Play, Calendar } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    category: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
    enrolled_at: string;
    status: 'completed' | 'in_progress' | 'not_started';
}

interface MyCoursesIndexProps {
    courses: Course[];
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    error?: string;
}

export default function MyCoursesIndex({ courses, user, error }: MyCoursesIndexProps) {
    if (error) {
        return (
            <AppLayout>
                <Head title="หลักสูตรของฉัน" />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />เสร็จสิ้น</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />กำลังเรียน</Badge>;
            case 'not_started':
                return <Badge className="bg-gray-100 text-gray-800"><Play className="h-3 w-3 mr-1" />ยังไม่เริ่ม</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="หลักสูตรของฉัน" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">หลักสูตรของฉัน</h1>
                    <p className="text-gray-600">หลักสูตรที่คุณได้ลงทะเบียนแล้ว</p>
                </div>

                {/* Courses List */}
                <div className="space-y-6">
                    {courses.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีหลักสูตร</h3>
                                <p className="text-gray-600 mb-4">คุณยังไม่ได้ลงทะเบียนหลักสูตรใดๆ</p>
                                <Button onClick={() => window.location.href = '/courses'}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    ดูหลักสูตรทั้งหมด
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {courses.map((course) => (
                                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                                                <CardDescription className="mb-3">{course.description}</CardDescription>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <BookOpen className="h-4 w-4 mr-1" />
                                                        {course.total_lessons} บทเรียน
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {new Date(course.enrolled_at).toLocaleDateString('th-TH')}
                                                    </span>
                                                    <span>หมวดหมู่: {course.category || 'ไม่ระบุ'}</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {getStatusBadge(course.status)}
                                            </div>
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
                                            
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => window.location.href = `/courses/${course.id}`}
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    {course.status === 'not_started' ? 'เริ่มเรียน' : 'เรียนต่อ'}
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => window.location.href = `/user-progress`}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    ดูความก้าวหน้า
                                                </Button>
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
