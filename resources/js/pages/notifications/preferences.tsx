import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Bell, ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'การแจ้งเตือน',
        href: '/notifications',
    },
    {
        title: 'ตั้งค่า',
        href: '/notifications/preferences',
    },
];

interface NotificationPreferences {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    course_completion: boolean;
    lesson_reminders: boolean;
    quiz_reminders: boolean;
    achievements: boolean;
    streaks: boolean;
    dropout_risk: boolean;
    new_courses: boolean;
    system_maintenance: boolean;
}

interface Props {
    preferences: NotificationPreferences;
    error?: string;
}

export default function NotificationPreferences({ preferences, error }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        email_notifications: preferences.email_notifications,
        push_notifications: preferences.push_notifications,
        sms_notifications: preferences.sms_notifications,
        course_completion: preferences.course_completion,
        lesson_reminders: preferences.lesson_reminders,
        quiz_reminders: preferences.quiz_reminders,
        achievements: preferences.achievements,
        streaks: preferences.streaks,
        dropout_risk: preferences.dropout_risk,
        new_courses: preferences.new_courses,
        system_maintenance: preferences.system_maintenance,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        form.put(route('notifications.update-preferences'), {
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    const handleToggle = (field: keyof NotificationPreferences) => {
        form.setData(field, !form.data[field]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ตั้งค่าการแจ้งเตือน" />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        กลับ
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">ตั้งค่าการแจ้งเตือน</h1>
                        <p className="text-muted-foreground">
                            จัดการการตั้งค่าการแจ้งเตือนของคุณ
                        </p>
                    </div>
                </div>

                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                การแจ้งเตือนทั่วไป
                            </CardTitle>
                            <CardDescription>
                                ตั้งค่าการแจ้งเตือนพื้นฐาน
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email_notifications">อีเมล</Label>
                                    <p className="text-sm text-muted-foreground">
                                        รับการแจ้งเตือนผ่านอีเมล
                                    </p>
                                </div>
                                <Switch
                                    id="email_notifications"
                                    checked={form.data.email_notifications}
                                    onCheckedChange={() => handleToggle('email_notifications')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push_notifications">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        รับการแจ้งเตือนแบบ Push
                                    </p>
                                </div>
                                <Switch
                                    id="push_notifications"
                                    checked={form.data.push_notifications}
                                    onCheckedChange={() => handleToggle('push_notifications')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="sms_notifications">SMS</Label>
                                    <p className="text-sm text-muted-foreground">
                                        รับการแจ้งเตือนผ่าน SMS
                                    </p>
                                </div>
                                <Switch
                                    id="sms_notifications"
                                    checked={form.data.sms_notifications}
                                    onCheckedChange={() => handleToggle('sms_notifications')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Learning Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>การแจ้งเตือนการเรียนรู้</CardTitle>
                            <CardDescription>
                                ตั้งค่าการแจ้งเตือนเกี่ยวกับการเรียนรู้
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="course_completion">การจบหลักสูตร</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนเมื่อจบหลักสูตร
                                    </p>
                                </div>
                                <Switch
                                    id="course_completion"
                                    checked={form.data.course_completion}
                                    onCheckedChange={() => handleToggle('course_completion')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="lesson_reminders">การเตือนบทเรียน</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนให้ทำบทเรียนต่อ
                                    </p>
                                </div>
                                <Switch
                                    id="lesson_reminders"
                                    checked={form.data.lesson_reminders}
                                    onCheckedChange={() => handleToggle('lesson_reminders')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="quiz_reminders">การเตือนแบบทดสอบ</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนเมื่อมีแบบทดสอบใหม่
                                    </p>
                                </div>
                                <Switch
                                    id="quiz_reminders"
                                    checked={form.data.quiz_reminders}
                                    onCheckedChange={() => handleToggle('quiz_reminders')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="achievements">ความสำเร็จ</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนเมื่อได้รับความสำเร็จ
                                    </p>
                                </div>
                                <Switch
                                    id="achievements"
                                    checked={form.data.achievements}
                                    onCheckedChange={() => handleToggle('achievements')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="streaks">Streak</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนเกี่ยวกับ Streak การเรียนรู้
                                    </p>
                                </div>
                                <Switch
                                    id="streaks"
                                    checked={form.data.streaks}
                                    onCheckedChange={() => handleToggle('streaks')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="dropout_risk">ความเสี่ยงในการออก</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนเมื่อมีความเสี่ยงในการออกจากหลักสูตร
                                    </p>
                                </div>
                                <Switch
                                    id="dropout_risk"
                                    checked={form.data.dropout_risk}
                                    onCheckedChange={() => handleToggle('dropout_risk')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>การแจ้งเตือนระบบ</CardTitle>
                            <CardDescription>
                                ตั้งค่าการแจ้งเตือนจากระบบ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="new_courses">หลักสูตรใหม่</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนเมื่อมีหลักสูตรใหม่
                                    </p>
                                </div>
                                <Switch
                                    id="new_courses"
                                    checked={form.data.new_courses}
                                    onCheckedChange={() => handleToggle('new_courses')}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="system_maintenance">การบำรุงรักษาระบบ</Label>
                                    <p className="text-sm text-muted-foreground">
                                        แจ้งเตือนเกี่ยวกับการบำรุงรักษาระบบ
                                    </p>
                                </div>
                                <Switch
                                    id="system_maintenance"
                                    checked={form.data.system_maintenance}
                                    onCheckedChange={() => handleToggle('system_maintenance')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={isLoading || form.processing}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {isLoading || form.processing ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}