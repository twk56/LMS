import { Form, Head } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

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
        title: 'หลักสูตร',
        href: '/courses',
    },
    {
        title: 'สร้างหลักสูตรใหม่',
        href: '/courses/create',
    },
];

export default function CreateCourse() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="สร้างหลักสูตรใหม่" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={route('courses.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
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

                {/* Form */}
                <div className="max-w-2xl">
                    <Form
                        method="post"
                        action={route('courses.store')}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="title">ชื่อหลักสูตร *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="ชื่อหลักสูตรของคุณ"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">คำอธิบาย</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="อธิบายเกี่ยวกับหลักสูตรนี้..."
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">รูปภาพ (URL)</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.image && (
                                        <p className="text-sm text-red-600">{errors.image}</p>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        สร้างหลักสูตร
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <a href={route('courses.index')}>ยกเลิก</a>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
} 