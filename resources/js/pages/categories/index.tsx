import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หมวดหมู่',
        href: '/categories',
    },
];

interface Category {
    id: number;
    name: string;
    description: string;
    courses_count: number;
    created_at: string;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="หมวดหมู่" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">หมวดหมู่</h1>
                        <p className="text-muted-foreground">
                            จัดการหมวดหมู่หลักสูตรทั้งหมด
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/categories/create">
                            <Plus className="mr-2 h-4 w-4" />
                            สร้างหมวดหมู่ใหม่
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <Card key={category.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{category.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {category.courses_count} หลักสูตร
                                    </span>
                                </CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        สร้างเมื่อ {new Date(category.created_at).toLocaleDateString('th-TH')}
                                    </span>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/categories/${category.id}`}>
                                            ดูรายละเอียด
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {categories.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">ไม่มีหมวดหมู่</h3>
                                <p className="text-muted-foreground mb-4">
                                    เริ่มต้นด้วยการสร้างหมวดหมู่แรกของคุณ
                                </p>
                                <Button asChild>
                                    <Link href="/categories/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        สร้างหมวดหมู่ใหม่
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
} 