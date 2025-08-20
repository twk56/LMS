import { Form, Head, router } from '@inertiajs/react';
import { BookOpen, Plus, Search, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

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
import { Input } from '@/components/ui/input';
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
    lessons?: any[];
    students?: any[];
}

interface CoursesIndexProps {
    courses: Course[];
    isAdmin: boolean;
    search?: string;
}

export default function CoursesIndex({ courses, isAdmin, search }: CoursesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== search) {
                router.get(route('courses.index'), { search: searchTerm }, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="หลักสูตร" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">หลักสูตร</h1>
                        <p className="text-muted-foreground">
                            {isAdmin ? 'จัดการหลักสูตรของคุณ' : 'ค้นหาหลักสูตรที่น่าสนใจ'}
                        </p>
                    </div>
                    {isAdmin && (
                        <Button asChild>
                            <a href={route('courses.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                สร้างหลักสูตรใหม่
                            </a>
                        </Button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาหลักสูตร..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Courses Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {isAdmin ? 'หลักสูตรของคุณ' : 'หลักสูตรทั้งหมด'}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {courses.length} หลักสูตร
                            {search && ` สำหรับ "${search}"`}
                        </span>
                    </div>
                    
                    {courses.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    {search ? 'ไม่พบหลักสูตรที่ค้นหา' : (isAdmin ? 'ยังไม่มีหลักสูตร' : 'ไม่พบหลักสูตร')}
                                </h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    {search 
                                        ? 'ลองค้นหาด้วยคำอื่น หรือล้างการค้นหา'
                                        : (isAdmin 
                                            ? 'เริ่มต้นสร้างหลักสูตรแรกของคุณเพื่อแบ่งปันความรู้'
                                            : 'ยังไม่มีหลักสูตรในระบบ'
                                        )
                                    }
                                </p>
                                {search ? (
                                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                                        ล้างการค้นหา
                                    </Button>
                                ) : isAdmin ? (
                                    <Button asChild>
                                        <a href={route('courses.create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            สร้างหลักสูตรแรก
                                        </a>
                                    </Button>
                                ) : null}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => (
                                <Card key={course.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="line-clamp-2 flex-1">{course.title}</CardTitle>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                course.status === 'published' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {course.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                            </span>
                                        </div>
                                        <CardDescription className="line-clamp-3">
                                            {course.description || 'ไม่มีคำอธิบาย'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>บทเรียน: {course.lessons?.length || 0}</span>
                                                {isAdmin && (
                                                    <span>ผู้เรียน: {course.students?.length || 0}</span>
                                                )}
                                            </div>
                                            {course.creator && (
                                                <div className="text-sm text-muted-foreground">
                                                    สร้างโดย: {course.creator.name}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button asChild className="flex-1">
                                                    <a href={route('courses.show', course.id)}>
                                                        ดูหลักสูตร
                                                    </a>
                                                </Button>
                                                {isAdmin && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="h-4 w-4 text-red-600" />
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
                                                                <Form method="delete" action={route('courses.destroy', course.id)}>
                                                                    <Button type="submit" variant="destructive">
                                                                        ลบหลักสูตร
                                                                    </Button>
                                                                </Form>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
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