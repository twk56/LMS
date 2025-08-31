import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Edit, Trash2, FileText, Image, Video, File, Calendar, HardDrive } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
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
    created_at: string;
    updated_at: string;
}

interface LessonFileShowProps {
    course: Course;
    lesson: Lesson;
    file: LessonFile;
}

export default function LessonFileShow({ course, lesson, file }: LessonFileShowProps) {
    const handleDelete = () => {
        router.delete(`/lessons/${lesson.id}/files/${file.id}`, {
            onError: (errors) => {
                console.error('File deletion failed:', errors);
            }
        });
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image':
                return <Image className="w-8 h-8 text-blue-500" />;
            case 'video':
                return <Video className="w-8 h-8 text-red-500" />;
            case 'pdf':
                return <FileText className="w-8 h-8 text-red-600" />;
            default:
                return <File className="w-8 h-8 text-gray-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${file.title || file.original_name} - ${lesson.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/lessons/${lesson.id}/files`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับไปไฟล์
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{file.title || file.original_name}</h1>
                            <p className="text-muted-foreground">
                                ไฟล์ในบทเรียน: {lesson.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={route('courses.lessons.files.download', [course.id, lesson.id, file.id])}>
                                <Download className="mr-2 h-4 w-4" />
                                ดาวน์โหลด
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('courses.lessons.files.edit', [course.id, lesson.id, file.id])}>
                                <Edit className="mr-2 h-4 w-4" />
                                แก้ไข
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* File Content */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        {/* File Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    {getFileIcon(file.file_type)}
                                    <div>
                                        <div className="text-xl">{file.title || file.original_name}</div>
                                        <div className="text-sm font-normal text-muted-foreground">
                                            {file.mime_type}
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {file.file_type === 'image' && (
                                    <div className="text-center">
                                        <img 
                                            src={file.url} 
                                            alt={file.title || file.original_name}
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                        />
                                    </div>
                                )}
                                
                                {file.file_type === 'video' && (
                                    <div className="text-center">
                                        <video 
                                            controls 
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                        >
                                            <source src={file.url} type={file.mime_type} />
                                            เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                                        </video>
                                    </div>
                                )}
                                
                                {file.file_type === 'pdf' && (
                                    <div className="text-center">
                                        <iframe 
                                            src={file.url} 
                                            className="w-full h-96 rounded-lg border"
                                            title={file.title || file.original_name}
                                        />
                                    </div>
                                )}
                                
                                {file.file_type === 'document' && (
                                    <div className="text-center py-12">
                                        <File className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้
                                        </p>
                                        <Button asChild className="mt-4">
                                            <Link href={route('courses.lessons.files.download', [course.id, lesson.id, file.id])}>
                                                <Download className="mr-2 h-4 w-4" />
                                                ดาวน์โหลดเพื่อดู
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* File Description */}
                        {file.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>คำอธิบาย</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {file.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* File Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลไฟล์</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">สถานะ</span>
                                    <Badge variant={file.is_active ? "default" : "secondary"}>
                                        {file.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">ประเภท</span>
                                    <span className="text-sm font-medium">{file.mime_type}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">ขนาด</span>
                                    <span className="text-sm font-medium">{file.formatted_size}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">ลำดับ</span>
                                    <span className="text-sm font-medium">{file.order}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle>วันที่</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">อัปโหลดเมื่อ</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(file.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">อัปเดตล่าสุด</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(file.updated_at)}
                                        </p>
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
                                <Button asChild className="w-full">
                                    <Link href={`/lessons/${lesson.id}/files/${file.id}/download`}>
                                        <Download className="mr-2 h-4 w-4" />
                                        ดาวน์โหลด
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href={`/lessons/${lesson.id}/files/${file.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        แก้ไข
                                    </Link>
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
