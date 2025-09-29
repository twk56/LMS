import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    {
        title: 'สร้างหลักสูตรใหม่',
        href: '/courses/create',
    },
];

interface CourseCategory {
    id: number;
    name: string;
}

interface PageProps {
    categories: CourseCategory[];
}

export default function CreateCourse({ categories = [] }: PageProps) {
    const form = useForm({
        title: '',
        description: '',
        image: '',
        category_id: '',
        new_category_name: '',
        category_option: 'existing', // 'existing' or 'new'
        status: 'draft',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/courses', { 
            preserveScroll: true,
            onError: (errors) => {
                console.error('Course creation failed:', errors);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="สร้างหลักสูตรใหม่" />
            
            <div className="container mx-auto py-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <a href="/courses">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับ
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">สร้างหลักสูตรใหม่</h1>
                            <p className="text-muted-foreground">
                                สร้างหลักสูตรใหม่เพื่อแบ่งปันความรู้ของคุณ
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Course Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลหลักสูตร</CardTitle>
                                <CardDescription>
                                    กำหนดชื่อ คำอธิบาย และการตั้งค่าพื้นฐานของหลักสูตร
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">ชื่อหลักสูตร *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        placeholder="ชื่อหลักสูตรของคุณ"
                                        className="mt-1"
                                        required
                                    />
                                    {form.errors.title && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">คำอธิบาย</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        placeholder="อธิบายเกี่ยวกับหลักสูตรนี้"
                                        className="mt-1"
                                        rows={4}
                                    />
                                    {form.errors.description && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>หมวดหมู่</Label>
                                    <RadioGroup
                                        value={form.data.category_option}
                                        onValueChange={(value) => form.setData('category_option', value)}
                                        className="mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="existing" id="existing" />
                                            <Label htmlFor="existing">เลือกจากหมวดหมู่ที่มีอยู่</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="new" id="new" />
                                            <Label htmlFor="new">สร้างหมวดหมู่ใหม่</Label>
                                        </div>
                                    </RadioGroup>

                                    {form.data.category_option === 'existing' && (
                                        <div className="mt-3">
                                            <Select
                                                value={form.data.category_id}
                                                onValueChange={(value) => form.setData('category_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.category_id && (
                                                <p className="text-sm text-red-600 mt-1">{form.errors.category_id}</p>
                                            )}
                                        </div>
                                    )}

                                    {form.data.category_option === 'new' && (
                                        <div className="mt-3">
                                            <Input
                                                value={form.data.new_category_name}
                                                onChange={(e) => form.setData('new_category_name', e.target.value)}
                                                placeholder="ชื่อหมวดหมู่ใหม่"
                                                required={form.data.category_option === 'new'}
                                            />
                                            {form.errors.new_category_name && (
                                                <p className="text-sm text-red-600 mt-1">{form.errors.new_category_name}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>

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

                                <div>
                                    <Label htmlFor="image">รูปภาพหลักสูตร (ไม่บังคับ)</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="url"
                                        value={form.data.image}
                                        onChange={(e) => form.setData('image', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ใส่ URL ของรูปภาพที่จะใช้เป็นภาพหน้าปกหลักสูตร
                                    </p>
                                    {form.errors.image && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.image}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Button variant="outline" asChild>
                                <a href="/courses">
                                    ยกเลิก
                                </a>
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {form.processing ? 'กำลังบันทึก...' : 'สร้างหลักสูตร'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
} 