import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description: string;
    courses_count: number;
    created_at: string;
    updated_at: string;
}

interface Statistics {
    total_categories: number;
    categories_with_courses: number;
    empty_categories: number;
}

interface Props {
    categories: Category[];
    statistics: Statistics;
    error?: string;
}

export default function AdminCategoriesIndex({ categories, statistics, error }: Props) {
    if (error) {
        return (
            <AppLayout>
                <Head title="จัดการหมวดหมู่" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="จัดการหมวดหมู่" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">จัดการหมวดหมู่</h1>
                        <p className="text-gray-600 mt-1">จัดการหมวดหมู่หลักสูตรทั้งหมด</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มหมวดหมู่
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">หมวดหมู่ทั้งหมด</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_categories}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">มีหลักสูตร</CardTitle>
                            <Layers className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.categories_with_courses}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">หมวดหมู่ว่าง</CardTitle>
                            <Layers className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{statistics.empty_categories}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Categories List */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการหมวดหมู่</CardTitle>
                        <CardDescription>
                            หมวดหมู่ทั้งหมด {categories.length} รายการ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categories.length === 0 ? (
                            <div className="text-center py-8">
                                <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีหมวดหมู่</h3>
                                <p className="text-gray-500 mb-4">เริ่มต้นด้วยการเพิ่มหมวดหมู่แรก</p>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    เพิ่มหมวดหมู่
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                                                <Badge variant={category.courses_count > 0 ? "default" : "secondary"}>
                                                    {category.courses_count} หลักสูตร
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 mt-1">{category.description}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                สร้างเมื่อ: {new Date(category.created_at).toLocaleDateString('th-TH')}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                แก้ไข
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                ลบ
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
