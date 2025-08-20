import { Form, Head, router } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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

interface LessonFile {
    file: File;
    title: string;
    description: string;
}

interface LessonCreateProps {
    course: Course;
}

export default function LessonCreate({ course }: LessonCreateProps) {
    const [contentType, setContentType] = useState<'text' | 'rich_text' | 'video' | 'file'>('text');
    const [files, setFiles] = useState<LessonFile[]>([]);
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const addFile = () => {
        setFiles([
            ...files,
            {
                file: new File([], ''),
                title: '',
                description: '',
            },
        ]);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const updateFile = (index: number, field: keyof LessonFile, value: any) => {
        const newFiles = [...files];
        (newFiles[index] as any)[field] = value;
        setFiles(newFiles);
    };

    const handleFileChange = (index: number, file: File) => {
        updateFile(index, 'file', file);
        if (!files[index].title) {
            updateFile(index, 'title', file.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', (document.getElementById('title') as HTMLInputElement).value);
        formData.append('content', (document.getElementById('content') as HTMLTextAreaElement).value);
        formData.append('content_type', contentType);
        formData.append('order', (document.getElementById('order') as HTMLInputElement).value);
        formData.append('status', (document.getElementById('status') as HTMLSelectElement).value);
        
        if (youtubeUrl) {
            formData.append('youtube_url', youtubeUrl);
        }

        // Add files
        files.forEach((fileData, index) => {
            if (fileData.file.size > 0) {
                formData.append(`files[]`, fileData.file);
                formData.append(`file_titles[]`, fileData.title);
                formData.append(`file_descriptions[]`, fileData.description);
            }
        });

        router.post(route('courses.lessons.store', course.id), formData);
    };

    const validateYouTubeUrl = (url: string) => {
        const youtubeRegex = /^https:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+$|^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/;
        return youtubeRegex.test(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`สร้างบทเรียน - ${course.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={route('courses.show', course.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับไปหลักสูตร
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">สร้างบทเรียน</h1>
                            <p className="text-muted-foreground">
                                หลักสูตร: {course.title}
                            </p>
                        </div>
                    </div>
                </div>

                <Form onSubmit={handleSubmit} className="space-y-6">
                    {/* Lesson Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>รายละเอียดบทเรียน</CardTitle>
                            <CardDescription>
                                กำหนดชื่อ คำอธิบาย และการตั้งค่าพื้นฐานของบทเรียน
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">ชื่อบทเรียน *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="ชื่อบทเรียน"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="order">ลำดับ *</Label>
                                    <Input
                                        id="order"
                                        name="order"
                                        type="number"
                                        min="0"
                                        placeholder="ลำดับในหลักสูตร"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="content">เนื้อหาบทเรียน *</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    placeholder="เนื้อหาบทเรียน"
                                    rows={8}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="content_type">ประเภทเนื้อหา *</Label>
                                    <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">ข้อความธรรมดา</SelectItem>
                                            <SelectItem value="rich_text">ข้อความแบบ Rich Text</SelectItem>
                                            <SelectItem value="video">วิดีโอ</SelectItem>
                                            <SelectItem value="file">ไฟล์</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">สถานะ *</Label>
                                    <Select name="status" defaultValue="draft">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">ร่าง</SelectItem>
                                            <SelectItem value="published">เผยแพร่</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* YouTube Video */}
                    {contentType === 'video' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>วิดีโอ YouTube</CardTitle>
                                <CardDescription>
                                    เพิ่มลิงก์วิดีโอ YouTube สำหรับบทเรียน
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="youtube_url">ลิงก์ YouTube</Label>
                                    <Input
                                        id="youtube_url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                    />
                                    {youtubeUrl && !validateYouTubeUrl(youtubeUrl) && (
                                        <p className="text-sm text-red-600">
                                            กรุณาใส่ลิงก์ YouTube ที่ถูกต้อง
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Files */}
                    {contentType === 'file' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>ไฟล์ในบทเรียน</CardTitle>
                                        <CardDescription>
                                            อัปโหลดไฟล์ที่เกี่ยวข้องกับบทเรียน
                                        </CardDescription>
                                    </div>
                                    <Button type="button" onClick={addFile} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        เพิ่มไฟล์
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {files.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            คลิกปุ่ม "เพิ่มไฟล์" เพื่ออัปโหลดไฟล์
                                        </p>
                                    </div>
                                ) : (
                                    files.map((fileData, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">ไฟล์ที่ {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>ไฟล์ *</Label>
                                                    <Input
                                                        type="file"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileChange(index, file);
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>ชื่อไฟล์</Label>
                                                    <Input
                                                        placeholder="ชื่อไฟล์"
                                                        value={fileData.title}
                                                        onChange={(e) => updateFile(index, 'title', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>คำอธิบาย</Label>
                                                <Textarea
                                                    placeholder="คำอธิบายไฟล์ (ไม่บังคับ)"
                                                    value={fileData.description}
                                                    onChange={(e) => updateFile(index, 'description', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <a href={route('courses.show', course.id)}>
                                ยกเลิก
                            </a>
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            สร้างบทเรียน
                        </Button>
                    </div>
                </Form>
            </div>
        </AppLayout>
    );
} 