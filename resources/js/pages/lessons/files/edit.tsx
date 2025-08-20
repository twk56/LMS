import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
}

interface Lesson {
    id: number;
    title: string;
}

interface LessonFile {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_type: string;
    mime_type: string;
    file_size: number;
    title: string | null;
    description: string | null;
    order: number;
    is_active: boolean;
    url: string;
    formatted_size: string;
    icon: string;
}

interface LessonFileEditProps {
    course: Course;
    lesson: Lesson;
    file: LessonFile;
}

export default function LessonFileEdit({ course, lesson, file }: LessonFileEditProps) {
    const [formData, setFormData] = useState({
        title: file.title || '',
        description: file.description || '',
        order: file.order,
        is_active: file.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.put(route('courses.lessons.files.update', [course.id, lesson.id, file.id]), formData);
    };

    const handleDelete = () => {
        router.delete(route('courses.lessons.files.destroy', [course.id, lesson.id, file.id]));
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image':
                return '🖼️';
            case 'video':
                return '🎥';
            case 'pdf':
                return '📄';
            default:
                return '📁';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`แก้ไขไฟล์ - ${file.title || file.original_name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={route('courses.lessons.files.index', [course.id, lesson.id])}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับไปไฟล์
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">แก้ไขไฟล์</h1>
                            <p className="text-muted-foreground">
                                บทเรียน: {lesson.title}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Form onSubmit={handleSubmit} className="space-y-6">
                            {/* File Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>รายละเอียดไฟล์</CardTitle>
                                    <CardDescription>
                                        แก้ไขข้อมูลและคำอธิบายของไฟล์
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">ชื่อไฟล์</Label>
                                        <Input
                                            id="title"
                                            placeholder="ชื่อไฟล์ (ไม่บังคับ)"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            หากไม่ระบุชื่อ จะใช้ชื่อไฟล์ต้นฉบับ
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">คำอธิบาย</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="คำอธิบายไฟล์ (ไม่บังคับ)"
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="order">ลำดับ</Label>
                                            <Input
                                                id="order"
                                                type="number"
                                                min="0"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 pt-6">
                                                <Checkbox
                                                    id="is_active"
                                                    checked={formData.is_active}
                                                    onCheckedChange={(checked) => 
                                                        setFormData({ ...formData, is_active: checked as boolean })
                                                    }
                                                />
                                                <Label htmlFor="is_active">เปิดใช้งาน</Label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit */}
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" asChild>
                                    <a href={route('courses.lessons.files.index', [course.id, lesson.id])}>
                                        ยกเลิก
                                    </a>
                                </Button>
                                <Button type="submit">
                                    <Save className="mr-2 h-4 w-4" />
                                    บันทึกการเปลี่ยนแปลง
                                </Button>
                            </div>
                        </Form>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* File Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลไฟล์</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                                    <div>
                                        <p className="font-medium">{file.original_name}</p>
                                        <p className="text-sm text-muted-foreground">{file.mime_type}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ขนาด:</span>
                                        <span>{file.formatted_size}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ประเภท:</span>
                                        <span>{file.file_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">สถานะ:</span>
                                        <span className={file.is_active ? 'text-green-600' : 'text-gray-500'}>
                                            {file.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>การดำเนินการ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" asChild className="w-full">
                                    <a href={route('courses.lessons.files.show', [course.id, lesson.id, file.id])}>
                                        ดูไฟล์
                                    </a>
                                </Button>
                                
                                <Button variant="outline" asChild className="w-full">
                                    <a href={route('courses.lessons.files.download', [course.id, lesson.id, file.id])}>
                                        ดาวน์โหลด
                                    </a>
                                </Button>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            ลบไฟล์
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>ยืนยันการลบ</DialogTitle>
                                            <DialogDescription>
                                                คุณต้องการลบไฟล์ "{file.original_name}" หรือไม่? 
                                                การดำเนินการนี้ไม่สามารถยกเลิกได้
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="destructive" onClick={handleDelete}>
                                                ลบ
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
