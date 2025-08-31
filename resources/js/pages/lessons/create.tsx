import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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

interface LessonCreateProps {
    course: Course;
}

export default function LessonCreate({ course }: LessonCreateProps) {
    const form = useForm({ 
        title: '', 
        content: '',
        content_type: 'text',
        order: 1,
        status: 'draft',
        youtube_url: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/courses/${course.id}/lessons`, { 
            preserveScroll: true,
            onError: (errors) => {
                console.error('Lesson creation failed:', errors);
            }
        });
    };

    const handleContentChange = (content: string) => {
        form.setData('content', content);
    };

    const extractYouTubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`สร้างบทเรียน - ${course.title}`} />
            
            <div className="container mx-auto py-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`/courses/${course.id}`}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับ
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">สร้างบทเรียน</h1>
                            <p className="text-muted-foreground">
                                สร้างบทเรียนใหม่ในหลักสูตร {course.title}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Lesson Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลบทเรียน</CardTitle>
                                <CardDescription>
                                    กำหนดชื่อ คำอธิบาย และการตั้งค่าพื้นฐานของบทเรียน
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">ชื่อบทเรียน *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        placeholder="ชื่อบทเรียน"
                                        className="mt-1"
                                        required
                                    />
                                    {form.errors.title && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.title}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="content_type">ประเภทเนื้อหา</Label>
                                        <Select
                                            value={form.data.content_type}
                                            onValueChange={(value) => form.setData('content_type', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="เลือกประเภทเนื้อหา" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">ข้อความธรรมดา</SelectItem>
                                                <SelectItem value="rich_text">Rich Text</SelectItem>
                                                <SelectItem value="video">วิดีโอ</SelectItem>
                                                <SelectItem value="file">ไฟล์</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.content_type && (
                                            <p className="text-sm text-red-600 mt-1">{form.errors.content_type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="order">ลำดับ</Label>
                                        <Input
                                            id="order"
                                            name="order"
                                            type="number"
                                            min="1"
                                            value={form.data.order}
                                            onChange={(e) => form.setData('order', Number(e.target.value))}
                                            placeholder="ลำดับในหลักสูตร"
                                            className="mt-1"
                                            required
                                        />
                                        {form.errors.order && (
                                            <p className="text-sm text-red-600 mt-1">{form.errors.order}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">สถานะ</Label>
                                        <Select
                                            value={form.data.status}
                                            onValueChange={(value) => form.setData('status', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="เลือกสถานะ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">ร่าง</SelectItem>
                                                <SelectItem value="published">เผยแพร่</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.status && (
                                            <p className="text-sm text-red-600 mt-1">{form.errors.status}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lesson Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>เนื้อหาบทเรียน</CardTitle>
                                <CardDescription>
                                    {form.data.content_type === 'rich_text' 
                                        ? 'ใช้ Rich Text Editor สำหรับเนื้อหาที่มีรูปแบบซับซ้อน'
                                        : 'เนื้อหาบทเรียน'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {form.data.content_type === 'rich_text' ? (
                                    <RichTextEditor
                                        value={form.data.content}
                                        onChange={handleContentChange}
                                        placeholder="เริ่มเขียนเนื้อหาบทเรียนของคุณ..."
                                    />
                                ) : (
                                    <div>
                                        <Label htmlFor="content">เนื้อหา *</Label>
                                        <Textarea
                                            id="content"
                                            name="content"
                                            value={form.data.content}
                                            onChange={(e) => form.setData('content', e.target.value)}
                                            placeholder="เนื้อหาบทเรียน"
                                            className="mt-1 min-h-[300px]"
                                            rows={12}
                                            required
                                        />
                                    </div>
                                )}
                                {form.errors.content && (
                                    <p className="text-sm text-red-600 mt-1">{form.errors.content}</p>
                                )}

                                {/* YouTube URL Input */}
                                <div>
                                    <Label htmlFor="youtube_url">ลิงก์ YouTube (ไม่บังคับ)</Label>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <Input
                                            id="youtube_url"
                                            type="url"
                                            value={form.data.youtube_url}
                                            onChange={(e) => form.setData('youtube_url', e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const url = form.data.youtube_url;
                                                if (url) {
                                                    const videoId = extractYouTubeVideoId(url);
                                                    if (videoId) {
                                                        form.setData('youtube_url', `https://www.youtube.com/watch?v=${videoId}`);
                                                    }
                                                }
                                            }}
                                        >
                                            ตรวจสอบ
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ใส่ลิงก์ YouTube เพื่อแสดงวิดีโอในบทเรียน
                                    </p>
                                    {form.data.youtube_url && (
                                        <div className="mt-2">
                                            <Label className="text-sm font-medium">ตัวอย่างวิดีโอ:</Label>
                                            <div className="mt-1 aspect-video w-full max-w-md">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${extractYouTubeVideoId(form.data.youtube_url)}`}
                                                    title="YouTube video"
                                                    className="w-full h-full rounded border"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button variant="outline" asChild>
                                <a href={`/courses/${course.id}`}>
                                    ยกเลิก
                                </a>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {form.processing ? 'กำลังบันทึก...' : 'สร้างบทเรียน'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
} 