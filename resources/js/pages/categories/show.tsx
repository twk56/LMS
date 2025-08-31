import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: 'หมวดหมู่',
        href: '/categories',
    },
];

interface Course {
    id: number;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
    creator: {
        name: string;
    };
}

interface CourseCategory {
    id: number;
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
    order: number;
    is_active: boolean;
    courses_count: number;
}

interface CategoryShowProps {
    category: CourseCategory;
    courses: {
        data: Course[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function CategoryShow({ category, courses }: CategoryShowProps) {
    const handleDelete = () => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) {
            router.delete(route('categories.destroy', category.id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge variant="default">เผยแพร่</Badge>;
            case 'draft':
                return <Badge variant="secondary">ร่าง</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`หมวดหมู่ - ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('categories.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับ
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{category.name}</h1>
                            <p className="text-muted-foreground">
                                ดูรายละเอียดและหลักสูตรในหมวดหมู่นี้
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('categories.edit', category.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                แก้ไข
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            ลบ
                        </Button>
                    </div>
                </div>

                {/* Category Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลหมวดหมู่</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">ชื่อ</span>
                                <span className="font-medium">{category.name}</span>
                            </div>
                            {category.description && (
                                <div className="flex items-start justify-between">
                                    <span className="text-muted-foreground">คำอธิบาย</span>
                                    <span className="font-medium text-right max-w-xs">
                                        {category.description}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">สี</span>
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="font-medium">{category.color}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">ลำดับ</span>
                                <span className="font-medium">{category.order}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">สถานะ</span>
                                <Badge variant={category.is_active ? "default" : "secondary"}>
                                    {category.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>สถิติ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">จำนวนหลักสูตร</span>
                                <span className="text-2xl font-bold text-primary">
                                    {category.courses_count}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">หลักสูตรที่เผยแพร่</span>
                                <span className="font-medium">
                                    {courses.data.filter(course => course.status === 'published').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">หลักสูตรแบบร่าง</span>
                                <span className="font-medium">
                                    {courses.data.filter(course => course.status === 'draft').length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Courses List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>หลักสูตรในหมวดหมู่นี้</CardTitle>
                                <CardDescription>
                                    รายการหลักสูตรทั้งหมดในหมวดหมู่ {category.name}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/courses/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    สร้างหลักสูตร
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {courses.data.length === 0 ? (
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    ยังไม่มีหลักสูตรในหมวดหมู่นี้
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/courses/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        สร้างหลักสูตรแรก
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {courses.data.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <h3 className="font-medium">
                                                <Link 
                                                    href={route('courses.show', course.id)}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {course.title}
                                                </Link>
                                            </h3>
                                            {course.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {course.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>โดย {course.creator.name}</span>
                                                <span>สร้างเมื่อ {new Date(course.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(course.status)}
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={route('courses.show', course.id)}>
                                                    ดูรายละเอียด
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
