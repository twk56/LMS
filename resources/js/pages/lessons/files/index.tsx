import { Head, Link } from '@inertiajs/react';
import { Plus, Download, Edit, Trash2, FileText, Image, Video, File, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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

interface LessonFilesIndexProps {
  course: Course;
  lesson: Lesson;
  files: LessonFile[];
}

export default function LessonFilesIndex({ course, lesson, files }: LessonFilesIndexProps) {
  const handleDelete = (fileId: number) => {
    router.delete(route('courses.lessons.files.destroy', [course.id, lesson.id, fileId]));
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

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
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`ไฟล์ - ${lesson.title}`} />
      
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('courses.lessons.show', [course.id, lesson.id])}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปบทเรียน
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">ไฟล์ในบทเรียน</h1>
              <p className="text-muted-foreground">
                บทเรียน: {lesson.title}
              </p>
            </div>
          </div>
          <Link href={route('courses.lessons.files.create', [course.id, lesson.id])}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              อัปโหลดไฟล์
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getFileIcon(file.file_type)}
                    {file.title || file.original_name}
                  </CardTitle>
                  <Badge variant={file.is_active ? "default" : "secondary"}>
                    {file.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>ชื่อไฟล์:</strong> {file.original_name}</p>
                    <p><strong>ประเภท:</strong> {file.mime_type}</p>
                    <p><strong>ขนาด:</strong> {file.formatted_size}</p>
                    {file.description && (
                      <p><strong>คำอธิบาย:</strong> {file.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      <Link href={route('courses.lessons.files.download', [course.id, lesson.id, file.id])}>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          ดาวน์โหลด
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={route('courses.lessons.files.edit', [course.id, lesson.id, file.id])}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
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
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDelete(file.id)}
                            >
                              ลบ
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center py-12">
            <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มีไฟล์</h3>
            <p className="text-muted-foreground mb-4">
              อัปโหลดไฟล์แรกของคุณเพื่อเพิ่มเนื้อหาให้บทเรียน
            </p>
            <Link href={route('courses.lessons.files.create', [course.id, lesson.id])}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                อัปโหลดไฟล์แรก
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 