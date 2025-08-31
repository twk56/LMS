import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCircle, X, Settings, Clock, AlertCircle, Info, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read_at: string | null;
    created_at: string;
    data?: Record<string, any>;
}

interface PageProps {
    notifications: Notification[];
    unread_count: number;
}

export default function NotificationsIndex({ notifications, unread_count }: PageProps) {
    const [loading, setLoading] = useState<number | null>(null);
    const [allLoading, setAllLoading] = useState(false);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case 'error':
                return <X className="h-4 w-4 text-red-600" />;
            default:
                return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getNotificationBadge = (type: string) => {
        switch (type) {
            case 'success':
                return <Badge variant="default" className="bg-green-100 text-green-800">สำเร็จ</Badge>;
            case 'warning':
                return <Badge variant="default" className="bg-yellow-100 text-yellow-800">คำเตือน</Badge>;
            case 'error':
                return <Badge variant="default" className="bg-red-100 text-red-800">ข้อผิดพลาด</Badge>;
            default:
                return <Badge variant="default" className="bg-blue-100 text-blue-800">ข้อมูล</Badge>;
        }
    };

    const markAsRead = async (notificationId: number) => {
        setLoading(notificationId);
        try {
            await router.post('/notifications/mark-as-read', {
                notification_id: notificationId
            }, {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Error marking as read:', errors);
                }
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        } finally {
            setLoading(null);
        }
    };

    const markAllAsRead = async () => {
        setAllLoading(true);
        try {
            await router.post('/notifications/mark-all-as-read', {}, {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Error marking all as read:', errors);
                }
            });
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setAllLoading(false);
        }
    };

    const deleteNotification = async (notificationId: number) => {
        setLoading(notificationId);
        try {
            await router.delete('/notifications/delete', {
                data: { notification_id: notificationId },
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Error deleting notification:', errors);
                }
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <AppLayout>
            <Head title="การแจ้งเตือน" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">การแจ้งเตือน</h1>
                        <p className="text-muted-foreground">
                            ติดตามกิจกรรมล่าสุดและข้อความจากระบบ
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {unread_count > 0 && (
                            <Button 
                                variant="outline" 
                                onClick={markAllAsRead}
                                disabled={allLoading}
                                className="w-full sm:w-auto"
                            >
                                {allLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                {allLoading ? 'กำลังประมวลผล...' : 'อ่านทั้งหมด'}
                            </Button>
                        )}
                        <Button variant="outline" asChild className="w-full sm:w-auto">
                            <Link href="/notifications/preferences">
                                <Settings className="mr-2 h-4 w-4" />
                                การตั้งค่า
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">การแจ้งเตือนที่ยังไม่ได้อ่าน</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unread_count}</div>
                        <p className="text-xs text-muted-foreground">
                            จากทั้งหมด {notifications.length} รายการ
                        </p>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">ไม่มีการแจ้งเตือน</h3>
                                <p className="text-muted-foreground text-center">
                                    คุณจะเห็นการแจ้งเตือนที่นี่เมื่อมีกิจกรรมใหม่
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.map((notification) => (
                            <Card key={notification.id} className={`transition-all duration-200 ${!notification.read_at ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-medium text-sm">{notification.title}</h4>
                                                    {getNotificationBadge(notification.type)}
                                                    {!notification.read_at && (
                                                        <Badge variant="secondary" className="text-xs">ใหม่</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {new Date(notification.created_at).toLocaleString('th-TH')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            {!notification.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                    disabled={loading === notification.id}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {loading === notification.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteNotification(notification.id)}
                                                disabled={loading === notification.id}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                            >
                                                {loading === notification.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <X className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
