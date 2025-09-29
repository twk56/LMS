import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Bell, Settings, Check, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    type: string;
    read: boolean;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
}

interface Props {
    notifications: Notification[];
    preferences?: any;
    error?: string;
}

export default function NotificationsIndex({ notifications, preferences, error }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsReadForm = useForm({
        notification_id: null as number | null,
    });

    const markAllAsReadForm = useForm({});

    const deleteForm = useForm({
        notification_id: null as number | null,
    });

    const handleMarkAsRead = (notificationId: number) => {
        setIsLoading(true);
        markAsReadForm.setData('notification_id', notificationId);
        markAsReadForm.post(route('notifications.mark-as-read'), {
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    const handleMarkAllAsRead = () => {
        setIsLoading(true);
        markAllAsReadForm.post(route('notifications.mark-all-as-read'), {
            onSuccess: (response) => {
                setIsLoading(false);
                console.log('Mark all as read success:', response);
            },
            onError: (errors) => {
                setIsLoading(false);
                console.error('Mark all as read error:', errors);
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleDelete = (notificationId: number) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบการแจ้งเตือนนี้?')) {
            setIsLoading(true);
            deleteForm.setData('notification_id', notificationId);
            deleteForm.delete(route('notifications.delete'), {
                onSuccess: () => {
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            });
        }
    };

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
                            <Button 
                                variant="outline" 
                                onClick={handleMarkAllAsRead}
                                disabled={isLoading || markAllAsReadForm.processing}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                {isLoading || markAllAsReadForm.processing ? 'กำลังประมวลผล...' : 'อ่านทั้งหมด'}
                            </Button>
                        )}
                    </div>
                </div>

                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {(markAsReadForm.errors.notification_id || markAllAsReadForm.errors || deleteForm.errors.notification_id) && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                            เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง
                        </AlertDescription>
                    </Alert>
                )}

                {/* Success Messages */}
                {markAsReadForm.recentlySuccessful && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                            ทำเครื่องหมายว่าอ่านแล้วสำเร็จ
                        </AlertDescription>
                    </Alert>
                )}

                {markAllAsReadForm.recentlySuccessful && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                            ทำเครื่องหมายว่าอ่านทั้งหมดสำเร็จ
                        </AlertDescription>
                    </Alert>
                )}

                {deleteForm.recentlySuccessful && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                            ลบการแจ้งเตือนสำเร็จ
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card key={notification.id} className={`transition-all ${!notification.read ? 'border-primary/20 bg-primary/5' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
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
                                        {!notification.read && (
                                            <Badge variant="default" className="text-xs">
                                                ใหม่
                                            </Badge>
                                        )}
                                        {!notification.read && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                disabled={isLoading || markAsReadForm.processing}
                                                title="ทำเครื่องหมายว่าอ่านแล้ว"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDelete(notification.id)}
                                            disabled={isLoading || deleteForm.processing}
                                            title="ลบการแจ้งเตือน"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>
                                        {new Date(notification.timestamp).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {notification.priority === 'high' ? 'สำคัญ' :
                                         notification.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
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
