import { Head, useForm } from '@inertiajs/react';
import { FileText, Download, Upload, ArrowLeft, AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: 'บทเรียน',
        href: '/lessons',
    },
    {
        title: 'ไฟล์บทเรียน',
        href: '#',
    },
];

interface LessonFile {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_type: string;
    mime_type: string;
    file_size: number;
    title: string;
    description?: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    url: string;
    formatted_size: string;
    icon: string;
}

interface Lesson {
    id: number;
    title: string;
    content: string;
    content_type: string;
    status: string;
    course: {
        id: number;
        title: string;
    };
}

interface PageProps {
    lesson: Lesson;
    files: LessonFile[];
    isAdmin: boolean;
    error?: string;
}

export default function LessonFiles({ lesson, files, isAdmin, error }: PageProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<LessonFile | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const uploadForm = useForm({
        file: null as File | null,
        title: '',
        description: '',
        order: 0,
    });

    const editForm = useForm({
        title: '',
        description: '',
        order: 0,
        is_active: true,
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(route('lessons.files.store', lesson.id), {
            onSuccess: () => {
                uploadForm.reset();
                setIsUploadOpen(false);
            },
        });
    };

    const handleEdit = (file: LessonFile) => {
        setEditingFile(file);
        editForm.setData({
            title: file.title,
            description: file.description || '',
            order: file.order,
            is_active: file.is_active,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFile) {
            editForm.put(route('lessons.files.update', [lesson.id, editingFile.id]), {
                onSuccess: () => {
                    setIsEditOpen(false);
                    setEditingFile(null);
                },
            });
        }
    };

    const handleDelete = (file: LessonFile) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้?')) {
            editForm.delete(route('lessons.files.destroy', [lesson.id, file.id]));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`ไฟล์บทเรียน - ${lesson.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Header */}
                <div className="flex items-center justify-between fade-in">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    ไฟล์บทเรียน
                                </h1>
                                <p className="text-base lg:text-lg text-muted-foreground">
                                    {lesson.title}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            กลับ
                        </Button>
                        {isAdmin && (
                            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        อัปโหลดไฟล์
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>อัปโหลดไฟล์</DialogTitle>
                                        <DialogDescription>
                                            อัปโหลดไฟล์สำหรับบทเรียน: {lesson.title}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUpload} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="file">ไฟล์</Label>
                                            <Input
                                                id="file"
                                                type="file"
                                                onChange={(e) => uploadForm.setData('file', e.target.files?.[0] || null)}
                                                required
                                            />
                                            {uploadForm.errors.file && (
                                                <p className="text-sm text-red-600">{uploadForm.errors.file}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="title">ชื่อไฟล์</Label>
                                            <Input
                                                id="title"
                                                value={uploadForm.data.title}
                                                onChange={(e) => uploadForm.setData('title', e.target.value)}
                                                placeholder="ชื่อไฟล์ (ไม่บังคับ)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">คำอธิบาย</Label>
                                            <Textarea
                                                id="description"
                                                value={uploadForm.data.description}
                                                onChange={(e) => uploadForm.setData('description', e.target.value)}
                                                placeholder="คำอธิบายไฟล์ (ไม่บังคับ)"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="order">ลำดับ</Label>
                                            <Input
                                                id="order"
                                                type="number"
                                                value={uploadForm.data.order}
                                                onChange={(e) => uploadForm.setData('order', parseInt(e.target.value) || 0)}
                                                min="0"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                                                ยกเลิก
                                            </Button>
                                            <Button type="submit" disabled={uploadForm.processing}>
                                                {uploadForm.processing ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Files List */}
                <div className="space-y-6 slide-up">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">ไฟล์ที่เกี่ยวข้อง</h2>
                    </div>

                    {files.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {files.map((file) => (
                                <Card key={file.id} className="card-modern group hover:scale-105 transition-all duration-300">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-lg">{file.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-sm font-medium truncate">
                                                    {file.title || file.original_name}
                                                </CardTitle>
                                                <CardDescription className="text-xs text-muted-foreground">
                                                    {file.formatted_size}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    {file.mime_type}
                                                </span>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex items-center gap-1"
                                                        onClick={() => window.open(file.url, '_blank')}
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        ดาวน์โหลด
                                                    </Button>
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex items-center gap-1"
                                                                onClick={() => handleEdit(file)}
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                                onClick={() => handleDelete(file)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {file.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {file.description}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="card-modern">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    ไม่มีไฟล์
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    ยังไม่มีไฟล์ที่เกี่ยวข้องกับบทเรียนนี้
                                </p>
                                {isAdmin && (
                                    <Button className="flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        อัปโหลดไฟล์แรก
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Edit Dialog */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>แก้ไขไฟล์</DialogTitle>
                                <DialogDescription>
                                    แก้ไขข้อมูลไฟล์: {editingFile?.title || editingFile?.original_name}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-title">ชื่อไฟล์</Label>
                                    <Input
                                        id="edit-title"
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        placeholder="ชื่อไฟล์"
                                    />
                                    {editForm.errors.title && (
                                        <p className="text-sm text-red-600">{editForm.errors.title}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">คำอธิบาย</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        placeholder="คำอธิบายไฟล์"
                                        rows={3}
                                    />
                                    {editForm.errors.description && (
                                        <p className="text-sm text-red-600">{editForm.errors.description}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-order">ลำดับ</Label>
                                    <Input
                                        id="edit-order"
                                        type="number"
                                        value={editForm.data.order}
                                        onChange={(e) => editForm.setData('order', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    {editForm.errors.order && (
                                        <p className="text-sm text-red-600">{editForm.errors.order}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="edit-active"
                                        type="checkbox"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="edit-active">ใช้งาน</Label>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing}>
                                        {editForm.processing ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
