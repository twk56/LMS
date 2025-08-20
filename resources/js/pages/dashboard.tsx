import { Head } from '@inertiajs/react';
import { BookOpen, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export default function Dashboard({ courses, isAdmin }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="หน้าหลัก" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">ยินดีต้อนรับ</h1>
                        <p className="text-muted-foreground">
                            {isAdmin ? 'จัดการหลักสูตรและบทเรียนของคุณ' : 'เริ่มต้นการเรียนรู้ของคุณ'}
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

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">หลักสูตรทั้งหมด</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{courses.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {isAdmin ? 'หลักสูตรที่คุณสร้าง' : 'หลักสูตรที่คุณลงทะเบียน'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">บทเรียนทั้งหมด</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {courses.reduce((total, course) => total + (course.lessons?.length || 0), 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">บทเรียนในหลักสูตรทั้งหมด</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ผู้เรียน</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isAdmin ? courses.reduce((total, course) => total + (course.students?.length || 0), 0) : '-'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {isAdmin ? 'ผู้เรียนทั้งหมด' : 'ไม่สามารถดูได้'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {isAdmin ? 'หลักสูตรของคุณ' : 'หลักสูตรที่ลงทะเบียน'}
                    </h2>
                    
                    {courses.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    {isAdmin ? 'ยังไม่มีหลักสูตร' : 'ยังไม่ได้ลงทะเบียนหลักสูตร'}
                                </h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    {isAdmin 
                                        ? 'เริ่มต้นสร้างหลักสูตรแรกของคุณเพื่อแบ่งปันความรู้'
                                        : 'ค้นหาหลักสูตรที่น่าสนใจและเริ่มต้นการเรียนรู้'
                                    }
                                </p>
                                {isAdmin ? (
                                    <Button asChild>
                                        <a href={route('courses.create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            สร้างหลักสูตรแรก
                                        </a>
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <a href={route('courses.index')}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            ดูหลักสูตรทั้งหมด
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => (
                                <Card key={course.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                        <CardDescription className="line-clamp-3">
                                            {course.description || 'ไม่มีคำอธิบาย'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{course.lessons?.length || 0} บทเรียน</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                course.status === 'published' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {course.status === 'published' ? 'เผยแพร่' : 'ร่าง'}
                                            </span>
                                        </div>
                                        <Button asChild className="w-full mt-4">
                                            <a href={route('courses.show', course.id)}>
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
