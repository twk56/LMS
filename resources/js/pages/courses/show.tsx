import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Edit, Plus, Trash2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    order: number;
    status: 'draft' | 'published';
}

interface Course {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'published';
    image: string | null;
    created_at: string;
    creator?: {
        name: string;
    };
    lessons: Lesson[];
}

interface CourseShowProps {
    course: Course;
    isAdmin: boolean;
    isEnrolled: boolean;
}

export default function CourseShow({ course, isAdmin, isEnrolled }: CourseShowProps) {
    const publishedLessons = course.lessons.filter(lesson => lesson.status === 'published');
    const draftLessons = course.lessons.filter(lesson => lesson.status === 'draft');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href="/courses">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับ
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{course.title}</h1>
                            <p className="text-muted-foreground">
                                สร้างโดย {course.creator?.name || 'ไม่ทราบ'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <>
                                <Button variant="outline" asChild>
                                    <a href={`/courses/${course.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        แก้ไข
                                    </a>
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            ลบหลักสูตร
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>ยืนยันการลบหลักสูตร</DialogTitle>
                                            <DialogDescription>
                                                คุณแน่ใจหรือไม่ที่จะลบหลักสูตร "{course.title}"? 
                                                การดำเนินการนี้จะลบหลักสูตรและบทเรียนทั้งหมดที่เกี่ยวข้อง และไม่สามารถยกเลิกได้
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                router.delete(`/courses/${course.id}`, {
                                                    onError: (errors) => {
                                                        console.error('Course deletion failed:', errors);
                                                    }
                                                });
                                            }}>
                                                <Button type="submit" variant="destructive">
                                                    ลบหลักสูตร
                                                </Button>
                                            </form>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                        {!isEnrolled && !isAdmin && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                router.post(`/courses/${course.id}/enroll`, {}, {
                                    onError: (errors: any) => {
                                        console.error('Error enrolling in course:', errors);
                                    }
                                });
                            }}>
                                <Button type="submit">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    ลงทะเบียนเรียน
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Course Info */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>คำอธิบายหลักสูตร</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {course.description || 'ไม่มีคำอธิบาย'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Lessons */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>บทเรียน</CardTitle>
                                    {isAdmin && (
                                        <Button size="sm" asChild>
                                            <a href={`/courses/${course.id}/lessons/create`}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                เพิ่มบทเรียน
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                <CardDescription>
                                    {publishedLessons.length} บทเรียนที่เผยแพร่
                                    {draftLessons.length > 0 && ` • ${draftLessons.length} บทเรียนร่าง`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {course.lessons.length === 0 ? (
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">ยังไม่มีบทเรียน</h3>
                                        <p className="text-muted-foreground text-center mb-4">
                                            {isAdmin 
                                                ? 'เริ่มต้นเพิ่มบทเรียนแรกของคุณ'
                                                : 'ยังไม่มีบทเรียนในหลักสูตรนี้'
                                            }
                                        </p>
                                        {isAdmin && (
                                            <Button asChild>
                                                <a href={`/courses/${course.id}/lessons/create`}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    เพิ่มบทเรียนแรก
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {course.lessons
                                            .sort((a, b) => a.order - b.order)
                                            .map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                            {lesson.order}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{lesson.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {lesson.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {isAdmin && (
                                                            <>
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <a href={`/lessons/${lesson.id}/edit`}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>ยืนยันการลบบทเรียน</DialogTitle>
                                                                            <DialogDescription>
                                                                                คุณแน่ใจหรือไม่ที่จะลบบทเรียน "{lesson.title}"? 
                                                                                การดำเนินการนี้ไม่สามารถยกเลิกได้
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <DialogFooter>
                                                                            <form onSubmit={(e) => {
                                                                                e.preventDefault();
                                                                                router.delete(`/lessons/${lesson.id}`, {
                                                                                    onError: (errors) => {
                                                                                        console.error('Lesson deletion failed:', errors);
                                                                                    }
                                                                                });
                                                                            }}>
                                                                                <Button type="submit" variant="destructive">
                                                                                    ลบบทเรียน
                                                                                </Button>
                                                                            </form>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </>
                                                        )}
                                                        {(isEnrolled || isAdmin) && lesson.status === 'published' && (
                                                            <Button size="sm" asChild>
                                                                <a href={`/lessons/${lesson.id}`}>
                                                                    เรียน
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">สถานะ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">สถานะหลักสูตร</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            course.status === 'published' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {course.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">จำนวนบทเรียน</span>
                                        <span className="font-medium">{course.lessons.length}</span>
                                    </div>
                                    {isEnrolled && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">สถานะการลงทะเบียน</span>
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                ลงทะเบียนแล้ว
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">ข้อมูลหลักสูตร</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>สร้างเมื่อ: {new Date(course.created_at).toLocaleDateString('th-TH')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 