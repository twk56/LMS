import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Bell, Settings, Check, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'การแจ้งเตือน',
        href: '/notifications',
    },
];

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
}

interface Props {
    notifications: Notification[];
}

export default function NotificationsIndex({ notifications }: Props) {
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="การแจ้งเตือน" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">การแจ้งเตือน</h1>
                        <p className="text-muted-foreground">
                            จัดการการแจ้งเตือนทั้งหมดของคุณ
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/notifications/preferences">
                                <Settings className="mr-2 h-4 w-4" />
                                ตั้งค่า
                            </Link>
                        </Button>
                        {unreadCount > 0 && (
                            <Button variant="outline">
                                <Check className="mr-2 h-4 w-4" />
                                อ่านทั้งหมด
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card key={notification.id} className={`transition-all ${!notification.is_read ? 'border-primary/20 bg-primary/5' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                            notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{notification.title}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {notification.message}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.is_read && (
                                            <Badge variant="default" className="text-xs">
                                                ใหม่
                                            </Badge>
                                        )}
                                        <Button variant="ghost" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>
                                        {new Date(notification.created_at).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {notification.type === 'success' ? 'สำเร็จ' :
                                         notification.type === 'warning' ? 'คำเตือน' :
                                         notification.type === 'error' ? 'ข้อผิดพลาด' : 'ข้อมูล'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {notifications.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="text-center">
                                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">ไม่มีการแจ้งเตือน</h3>
                                <p className="text-muted-foreground mb-4">
                                    คุณจะเห็นการแจ้งเตือนใหม่ที่นี่เมื่อมีกิจกรรมเกิดขึ้น
                                </p>
                                <Button variant="outline" asChild>
                                    <Link href="/notifications/preferences">
                                        <Settings className="mr-2 h-4 w-4" />
                                        ตั้งค่าการแจ้งเตือน
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
