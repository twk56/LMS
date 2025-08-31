import { Head, useForm } from '@inertiajs/react';
import { Bell, Save, ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';

interface NotificationPreferences {
    email_notifications: boolean;
    push_notifications: boolean;
    course_updates: boolean;
    lesson_completions: boolean;
    system_announcements: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
}

interface PageProps {
    preferences?: NotificationPreferences;
}

const defaultPreferences: NotificationPreferences = {
    email_notifications: true,
    push_notifications: true,
    course_updates: true,
    lesson_completions: true,
    system_announcements: true,
    frequency: 'immediate',
};

export default function NotificationsPreferences({ preferences = defaultPreferences }: PageProps) {
    const form = useForm<NotificationPreferences>({
        email_notifications: preferences.email_notifications,
        push_notifications: preferences.push_notifications,
        course_updates: preferences.course_updates,
        lesson_completions: preferences.lesson_completions,
        system_announcements: preferences.system_announcements,
        frequency: preferences.frequency,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/notifications/update-preferences', { 
            preserveScroll: true,
            onError: (errors) => {
                console.error('Error updating preferences:', errors);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="การตั้งค่าการแจ้งเตือน" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">การตั้งค่าการแจ้งเตือน</h1>
                        <p className="text-muted-foreground">
                            ปรับแต่งวิธีการและเวลาที่คุณต้องการรับการแจ้งเตือน
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/notifications">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับไปการแจ้งเตือน
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Bell className="h-5 w-5" />
                                <span>การตั้งค่าทั่วไป</span>
                            </CardTitle>
                            <CardDescription>
                                เลือกวิธีการแจ้งเตือนที่คุณต้องการ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email_notifications">การแจ้งเตือนทางอีเมล</Label>
                                    <p className="text-sm text-muted-foreground">
                                        รับการแจ้งเตือนผ่านอีเมล
                                    </p>
                                </div>
                                <Switch
                                    id="email_notifications"
                                    checked={form.data.email_notifications}
                                    onCheckedChange={(checked: boolean) => form.setData('email_notifications', checked)}
                                />
                            </div>
                            {form.errors.email_notifications && (
                                <p className="text-sm text-red-600">{form.errors.email_notifications}</p>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push_notifications">การแจ้งเตือนแบบ Push</Label>
                                    <p className="text-sm text-muted-foreground">
                                        รับการแจ้งเตือนผ่านเบราว์เซอร์
                                    </p>
                                </div>
                                <Switch
                                    id="push_notifications"
                                    checked={form.data.push_notifications}
                                    onCheckedChange={(checked: boolean) => form.setData('push_notifications', checked)}
                                />
                            </div>
                            {form.errors.push_notifications && (
                                <p className="text-sm text-red-600">{form.errors.push_notifications}</p>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="frequency">ความถี่ในการแจ้งเตือน</Label>
                                <Select
                                    value={form.data.frequency}
                                    onValueChange={(value: 'immediate' | 'daily' | 'weekly') => 
                                        form.setData('frequency', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกความถี่" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="immediate">ทันที</SelectItem>
                                        <SelectItem value="daily">สรุปรายวัน</SelectItem>
                                        <SelectItem value="weekly">สรุปรายสัปดาห์</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    ความถี่ที่คุณต้องการรับการแจ้งเตือน
                                </p>
                                {form.errors.frequency && (
                                    <p className="text-sm text-red-600">{form.errors.frequency}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Course Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>การแจ้งเตือนหลักสูตร</CardTitle>
                            <CardDescription>
                                จัดการการแจ้งเตือนที่เกี่ยวข้องกับหลักสูตรของคุณ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="course_updates">การอัปเดตหลักสูตร</Label>
                                    <p className="text-sm text-muted-foreground">
                                        บทเรียนใหม่ การประกาศ หรือการเปลี่ยนแปลงหลักสูตร
                                    </p>
                                </div>
                                <Switch
                                    id="course_updates"
                                    checked={form.data.course_updates}
                                    onCheckedChange={(checked: boolean) => form.setData('course_updates', checked)}
                                />
                            </div>
                            {form.errors.course_updates && (
                                <p className="text-sm text-red-600">{form.errors.course_updates}</p>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="lesson_completions">การเสร็จสิ้นบทเรียน</Label>
                                    <p className="text-sm text-muted-foreground">
                                        เมื่อคุณเรียนจบบทเรียน
                                    </p>
                                </div>
                                <Switch
                                    id="lesson_completions"
                                    checked={form.data.lesson_completions}
                                    onCheckedChange={(checked: boolean) => form.setData('lesson_completions', checked)}
                                />
                            </div>
                            {form.errors.lesson_completions && (
                                <p className="text-sm text-red-600">{form.errors.lesson_completions}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* System Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>การแจ้งเตือนระบบ</CardTitle>
                            <CardDescription>
                                การประกาศและอัปเดตระบบที่สำคัญ
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="system_announcements">การประกาศระบบ</Label>
                                    <p className="text-sm text-muted-foreground">
                                        อัปเดตที่สำคัญเกี่ยวกับแพลตฟอร์ม
                                    </p>
                                </div>
                                <Switch
                                    id="system_announcements"
                                    checked={form.data.system_announcements}
                                    onCheckedChange={(checked: boolean) => form.setData('system_announcements', checked)}
                                />
                            </div>
                            {form.errors.system_announcements && (
                                <p className="text-sm text-red-600">{form.errors.system_announcements}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {form.processing ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
