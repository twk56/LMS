import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Plus, Search, Filter, BookOpen, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface CourseCategory {
    id: number;
    name: string;
    color: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
    creator: User;
    category: CourseCategory;
    lessons_count: number;
    students_count: number;
}

interface Props {
    courses: Course[];
    isAdmin: boolean;
    search?: string;
}

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

export default function CoursesIndex({ courses, isAdmin, search = '' }: Props) {
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredCourses = courses.filter(course => {
        const title = course.title || '';
        const description = course.description || '';
        
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default">เผยแพร่</Badge>;
            case 'draft':
                return <Badge variant="secondary">ร่าง</Badge>;
            case 'archived':
                return <Badge variant="outline">เก็บถาวร</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="หลักสูตร" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">หลักสูตร</h1>
                        <p className="text-muted-foreground">
                            จัดการหลักสูตรและเนื้อหาการเรียน
                        </p>
                    </div>
                    {isAdmin && (
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/courses/create">
                                <Plus className="mr-2 h-4 w-4" />
                                สร้างหลักสูตร
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาหลักสูตร..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="published">เผยแพร่</option>
                        <option value="draft">ร่าง</option>
                        <option value="archived">เก็บถาวร</option>
                    </select>
                </div>

                {/* Courses Grid */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                        <Card key={course.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="line-clamp-2">
                                            <Link 
                                                href={`/courses/${course.id}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {course.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 mt-2">
                                            {course.description}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(course.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Category */}
                                    {course.category && (
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: course.category.color }}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {course.category.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{course.lessons_count} บทเรียน</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{course.students_count} นักเรียน</span>
                                        </div>
                                    </div>

                                    {/* Created by */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>โดย {course.creator.name}</span>
                                        <span>•</span>
                                        <span>{new Date(course.created_at).toLocaleDateString('th-TH')}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button asChild size="sm" className="flex-1">
                                            <Link href={`/courses/${course.id}`}>
                                                ดูรายละเอียด
                                            </Link>
                                        </Button>
                                        {isAdmin && (
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/courses/${course.id}/edit`}>
                                                    แก้ไข
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">ไม่พบหลักสูตร</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || filterStatus !== 'all' 
                                ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' 
                                : 'ยังไม่มีหลักสูตรในระบบ'
                            }
                        </p>
                        {isAdmin && (
                            <Button asChild>
                                <Link href="/courses/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    สร้างหลักสูตรแรก
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 