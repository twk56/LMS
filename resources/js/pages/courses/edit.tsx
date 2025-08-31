import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
}

interface EditCourseProps {
    course: Course;
}

export default function EditCourse({ course }: EditCourseProps) {
    const { data, setData, patch, processing, errors } = useForm({
        title: course.title,
        description: course.description || '',
        image: course.image || '',
        status: course.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/courses/${course.id}`, {
            onError: (errors) => {
                console.error('Course update failed:', errors);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`แก้ไขหลักสูตร - ${course.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={`/courses/${course.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับ
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">แก้ไขหลักสูตร</h1>
                        <p className="text-muted-foreground">
                            แก้ไขข้อมูลหลักสูตร "{course.title}"
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="title">ชื่อหลักสูตร *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="ชื่อหลักสูตรของคุณ"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">คำอธิบาย</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="อธิบายเกี่ยวกับหลักสูตรนี้..."
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">รูปภาพ (URL)</Label>
                                    <Input
                                        id="image"
                                        value={data.image}
                                        onChange={(e) => setData('image', e.target.value)}
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.image && (
                                        <p className="text-sm text-red-600">{errors.image}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">สถานะ *</Label>
                                    <Select value={data.status} onValueChange={(value: 'draft' | 'published') => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกสถานะ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">ร่าง</SelectItem>
                                            <SelectItem value="published">เผยแพร่</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        บันทึกการเปลี่ยนแปลง
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`/courses/${course.id}`}>ยกเลิก</a>
                                    </Button>
                                </div>
                            </>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
} 