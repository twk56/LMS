import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: course.title,
        href: route('courses.show', course.id),
    },
    {
        title: lesson.title,
        href: route('courses.lessons.show', [course.id, lesson.id]),
    },
    {
        title: 'ไฟล์',
        href: route('courses.lessons.files.index', [course.id, lesson.id]),
    },
    {
        title: 'อัปโหลดไฟล์',
        href: '#',
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

interface CreateFileProps {
    course: Course;
    lesson: Lesson;
}

export default function CreateFile({ course, lesson }: CreateFileProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setFiles(fileList);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (files.length === 0) {
            alert('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์');
            return;
        }

        setProcessing(true);
        
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files[]', file);
        });
        formData.append('title', title);
        formData.append('description', description);

        router.post(route('courses.lessons.files.store', [course.id, lesson.id]), formData, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="อัปโหลดไฟล์" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={route('courses.lessons.files.index', [course.id, lesson.id])}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับไปไฟล์
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">อัปโหลดไฟล์</h1>
                            <p className="text-muted-foreground">
                                บทเรียน: {lesson.title}
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>อัปโหลดไฟล์ใหม่</CardTitle>
                        <CardDescription>
                            เลือกไฟล์ที่ต้องการอัปโหลด (รองรับรูปภาพ, วิดีโอ, PDF และเอกสาร)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="files">ไฟล์</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4">
                                        <Input
                                            id="files"
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('files')?.click()}
                                        >
                                            เลือกไฟล์
                                        </Button>
                                        <p className="text-sm text-gray-500 mt-2">
                                            หรือลากไฟล์มาวางที่นี่
                                        </p>
                                    </div>
                                </div>
                                {/* errors.files && (
                                    <p className="text-sm text-red-600">{errors.files}</p>
                                ) */}
                            </div>

                            {/* Selected Files */}
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <Label>ไฟล์ที่เลือก</Label>
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-sm">
                                                        <p className="font-medium">{file.name}</p>
                                                        <p className="text-gray-500">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">ชื่อไฟล์ (ไม่บังคับ)</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="ชื่อไฟล์หรือคำอธิบายสั้นๆ"
                                />
                                {/* errors.title && (
                                    <p className="text-sm text-red-600">{errors.title}</p>
                                ) */}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">คำอธิบาย (ไม่บังคับ)</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับไฟล์"
                                    rows={3}
                                />
                                {/* errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                ) */}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={processing || files.length === 0}>
                                    {processing ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
