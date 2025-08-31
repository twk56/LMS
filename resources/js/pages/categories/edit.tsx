import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
        title: 'หมวดหมู่',
        href: '/categories',
    },
];

interface CourseCategory {
    id: number;
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
    order: number;
    is_active: boolean;
}

interface CategoryEditProps {
    category: CourseCategory;
}

export default function CategoryEdit({ category }: CategoryEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon || '',
        order: category.order,
        is_active: category.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('categories.update', category.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`แก้ไขหมวดหมู่ - ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={route('categories.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับ
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">แก้ไขหมวดหมู่</h1>
                        <p className="text-muted-foreground">
                            แก้ไขข้อมูลหมวดหมู่หลักสูตร
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลหมวดหมู่</CardTitle>
                                <CardDescription>
                                    แก้ไขข้อมูลพื้นฐานของหมวดหมู่
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">ชื่อหมวดหมู่ *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="ชื่อหมวดหมู่"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">คำอธิบาย</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="คำอธิบายหมวดหมู่"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="color">สี *</Label>
                                        <Input
                                            id="color"
                                            name="color"
                                            type="color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            required
                                        />
                                        {errors.color && (
                                            <p className="text-sm text-red-600">{errors.color}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="order">ลำดับ</Label>
                                        <Input
                                            id="order"
                                            name="order"
                                            type="number"
                                            min="0"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        {errors.order && (
                                            <p className="text-sm text-red-600">{errors.order}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="icon">ไอคอน</Label>
                                    <Input
                                        id="icon"
                                        name="icon"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        placeholder="ชื่อไอคอน (ไม่บังคับ)"
                                    />
                                    {errors.icon && (
                                        <p className="text-sm text-red-600">{errors.icon}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="is_active"
                                        name="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_active">เปิดใช้งาน</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing && <Save className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึกการเปลี่ยนแปลง
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <a href={route('categories.index')}>ยกเลิก</a>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
