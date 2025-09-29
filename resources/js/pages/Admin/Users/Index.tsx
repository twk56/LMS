import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Activity } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    enrolled_courses: number;
    total_messages: number;
    created_at: string;
    last_login: string | null;
}

interface Statistics {
    total_users: number;
    admin_users: number;
    student_users: number;
    active_users: number;
}

interface AdminUsersIndexProps {
    users: User[];
    statistics: Statistics;
    error?: string;
}

export default function AdminUsersIndex({ users, statistics, error }: AdminUsersIndexProps) {
    if (error) {
        return (
            <AppLayout>
                <Head title="จัดการผู้ใช้" />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="จัดการผู้ใช้" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการผู้ใช้</h1>
                    <p className="text-gray-600">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_users}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ผู้ดูแลระบบ</CardTitle>
                            <UserCheck className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{statistics.admin_users}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ผู้เรียน</CardTitle>
                            <UserX className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.student_users}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ผู้ใช้ที่ใช้งานล่าสุด</CardTitle>
                            <Activity className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{statistics.active_users}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users List */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">รายชื่อผู้ใช้</h2>
                    
                    {users.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีผู้ใช้</h3>
                                <p className="text-gray-600">ยังไม่มีผู้ใช้ในระบบ</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {users.map((user) => (
                                <Card key={user.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{user.name}</h3>
                                                    <p className="text-gray-600">{user.email}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                        <span>ลงทะเบียน: {new Date(user.created_at).toLocaleDateString('th-TH')}</span>
                                                        {user.last_login && (
                                                            <span>เข้าสู่ระบบล่าสุด: {new Date(user.last_login).toLocaleDateString('th-TH')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">หลักสูตรที่ลงทะเบียน</div>
                                                    <div className="text-lg font-semibold">{user.enrolled_courses}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">ข้อความแชท</div>
                                                    <div className="text-lg font-semibold">{user.total_messages}</div>
                                                </div>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้เรียน'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
