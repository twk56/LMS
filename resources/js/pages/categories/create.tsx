import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    {
        title: 'สร้างหมวดหมู่ใหม่',
        href: '/categories/create',
    },
];

export default function CreateCategory() {
    const form = useForm({
        name: '',
        description: '',
        color: '#3b82f6'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('categories.store'), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="สร้างหมวดหมู่ใหม่" />
            
            <div className="container mx-auto py-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={route('categories.index')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับ
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">สร้างหมวดหมู่ใหม่</h1>
                            <p className="text-muted-foreground">
                                เพิ่มหมวดหมู่ใหม่สำหรับจัดกลุ่มหลักสูตร
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลหมวดหมู่</CardTitle>
                            <CardDescription>
                                กำหนดชื่อ คำอธิบาย และสีของหมวดหมู่
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">ชื่อหมวดหมู่ *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="เช่น การพัฒนาเว็บ, การออกแบบ, การตลาด"
                                        className="mt-1"
                                        required
                                    />
                                    {form.errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">คำอธิบาย</Label>
                                    <Textarea
                                        id="description"
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        placeholder="อธิบายเกี่ยวกับหมวดหมู่นี้"
                                        className="mt-1"
                                        rows={3}
                                    />
                                    {form.errors.description && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="color">สี</Label>
                                    <div className="mt-1 flex items-center gap-3">
                                        <Input
                                            id="color"
                                            type="color"
                                            value={form.data.color}
                                            onChange={(e) => form.setData('color', e.target.value)}
                                            className="h-12 w-20"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">
                                                เลือกสีที่จะใช้แสดงหมวดหมู่นี้
                                            </p>
                                        </div>
                                    </div>
                                    {form.errors.color && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.color}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 pt-6">
                                    <Button variant="outline" asChild>
                                        <a href={route('categories.index')}>
                                            ยกเลิก
                                        </a>
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {form.processing ? 'กำลังบันทึก...' : 'สร้างหมวดหมู่'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 