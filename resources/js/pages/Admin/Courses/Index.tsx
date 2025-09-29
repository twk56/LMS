import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, BookMarked, Users, FileText, Layers, Activity, UserPlus, CheckCircle } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string;
    category: string;
    total_lessons: number;
    enrolled_users: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface Statistics {
    total_courses: number;
    published_courses: number;
    draft_courses: number;
    total_enrollments: number;
}

interface Activity {
    type: string;
    message: string;
    created_at: string;
    icon: string;
}

interface Props {
    courses: Course[];
    statistics: Statistics;
    recentActivities?: Activity[];
    error?: string;
}

export default function AdminCoursesIndex({ courses, statistics, recentActivities = [], error }: Props) {
    if (error) {
        return (
            <AppLayout>
                <Head title="จัดการหลักสูตร" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-green-100 text-green-800">เผยแพร่แล้ว</Badge>;
            case 'draft':
                return <Badge className="bg-yellow-100 text-yellow-800">ร่าง</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="จัดการหลักสูตร" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">จัดการหลักสูตร</h1>
                        <p className="text-gray-600 mt-1">จัดการหลักสูตรทั้งหมดในระบบ</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มหลักสูตร
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">หลักสูตรทั้งหมด</CardTitle>
                            <BookMarked className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_courses}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">เผยแพร่แล้ว</CardTitle>
                            <BookMarked className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.published_courses}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ร่าง</CardTitle>
                            <BookMarked className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{statistics.draft_courses}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">การลงทะเบียน</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{statistics.total_enrollments}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                {recentActivities.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="h-5 w-5" />
                                <span>กิจกรรมล่าสุด</span>
                            </CardTitle>
                            <CardDescription>
                                กิจกรรมล่าสุดในระบบหลักสูตร
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            {activity.icon === 'user-plus' ? (
                                                <UserPlus className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">{activity.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(activity.created_at).toLocaleString('th-TH')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Courses List */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการหลักสูตร</CardTitle>
                        <CardDescription>
                            หลักสูตรทั้งหมด {courses.length} รายการ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {courses.length === 0 ? (
                            <div className="text-center py-8">
                                <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีหลักสูตร</h3>
                                <p className="text-gray-500 mb-4">เริ่มต้นด้วยการเพิ่มหลักสูตรแรก</p>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    เพิ่มหลักสูตร
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {courses.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                                                {getStatusBadge(course.status)}
                                            </div>
                                            <p className="text-gray-600 mb-2">{course.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Layers className="h-4 w-4" />
                                                    <span>{course.category}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <FileText className="h-4 w-4" />
                                                    <span>{course.total_lessons} บทเรียน</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{course.enrolled_users} ผู้เรียน</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                สร้างเมื่อ: {new Date(course.created_at).toLocaleDateString('th-TH')}
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
