import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import TextLink from '@/components/text-link';

interface Course {
  id: number;
  title: string;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  content_type: string;
  order: number;
  status: string;
  youtube_url?: string;
}

interface Props {
  course: Course;
  lesson: Lesson;
}

export default function LessonsEdit({ course, lesson }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    title: lesson.title,
    content: lesson.content,
    content_type: lesson.content_type,
    order: lesson.order,
    status: lesson.status,
    youtube_url: lesson.youtube_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/lessons/${lesson.id}`, {
        onError: (errors) => {
            console.error('Lesson update failed:', errors);
        }
    });
  };

  const handleContentChange = (content: string) => {
    setData('content', content);
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
    <>
      <Head title={`แก้ไขบทเรียน - ${lesson.title}`} />
      
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <TextLink href={`/courses/${course.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
            </TextLink>
            <div>
              <h1 className="text-3xl font-bold">แก้ไขบทเรียน</h1>
              <p className="text-muted-foreground">แก้ไขเนื้อหาบทเรียนในหลักสูตร {course.title}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลบทเรียน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">ชื่อบทเรียน *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="ชื่อบทเรียน"
                    className="mt-1"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="content_type">ประเภทเนื้อหา</Label>
                    <Select
                      value={data.content_type}
                      onValueChange={(value) => setData('content_type', value)}
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
                    {errors.content_type && (
                      <p className="text-sm text-red-600 mt-1">{errors.content_type}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="order">ลำดับ</Label>
                    <Input
                      id="order"
                      type="number"
                      value={data.order}
                      onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="mt-1"
                      min="0"
                    />
                    {errors.order && (
                      <p className="text-sm text-red-600 mt-1">{errors.order}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status">สถานะ</Label>
                    <Select
                      value={data.status}
                      onValueChange={(value) => setData('status', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">ร่าง</SelectItem>
                        <SelectItem value="published">เผยแพร่</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>เนื้อหาบทเรียน</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {data.content_type === 'rich_text' 
                    ? 'ใช้ Rich Text Editor สำหรับเนื้อหาที่มีรูปแบบซับซ้อน'
                    : 'เนื้อหาบทเรียน'
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.content_type === 'rich_text' ? (
                  <RichTextEditor
                    value={data.content}
                    onChange={handleContentChange}
                    placeholder="เริ่มเขียนเนื้อหาบทเรียนของคุณ..."
                  />
                ) : (
                  <div>
                    <Label htmlFor="content">เนื้อหา *</Label>
                    <textarea
                      id="content"
                      value={data.content}
                      onChange={(e) => setData('content', e.target.value)}
                      placeholder="เนื้อหาบทเรียน"
                      className="mt-1 w-full min-h-[300px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={12}
                    />
                  </div>
                )}
                {errors.content && (
                  <p className="text-sm text-red-600 mt-1">{errors.content}</p>
                )}

                {/* YouTube URL Input */}
                <div>
                  <Label htmlFor="youtube_url">ลิงก์ YouTube (ไม่บังคับ)</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input
                      id="youtube_url"
                      type="url"
                      value={data.youtube_url}
                      onChange={(e) => setData('youtube_url', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = data.youtube_url;
                        if (url) {
                          const videoId = extractYouTubeVideoId(url);
                          if (videoId) {
                            setData('youtube_url', `https://www.youtube.com/watch?v=${videoId}`);
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
                  {data.youtube_url && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">ตัวอย่างวิดีโอ:</Label>
                      <div className="mt-1 aspect-video w-full max-w-md">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeVideoId(data.youtube_url)}`}
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

            <div className="flex justify-between items-center pt-6">
              <div className="flex items-center gap-4">
                <TextLink href={`/lessons/${lesson.id}`}>
                  <Button type="button" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    ดูตัวอย่าง
                  </Button>
                </TextLink>
                                  <TextLink href={`/lessons/${lesson.id}/files`}>
                  <Button type="button" variant="outline">
                    จัดการไฟล์
                  </Button>
                </TextLink>
              </div>
              
              <div className="flex gap-4">
                <TextLink href={`/courses/${course.id}`}>
                  <Button type="button" variant="outline">
                    ยกเลิก
                  </Button>
                </TextLink>
                <Button type="submit" disabled={processing}>
                  <Save className="w-4 h-4 mr-2" />
                  {processing ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 