import { Head } from '@inertiajs/react';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import { useTheme } from '@/components/theme-provider';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: 'การตั้งค่า',
        href: '/settings/profile',
    },
    {
        title: 'การแสดงผล',
        href: '/settings/appearance',
    },
];



export default function AppearanceSettings() {
    const { theme, setTheme } = useTheme();

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="การตั้งค่าการแสดงผล" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">การตั้งค่าธีม</h1>
                        <p className="text-muted-foreground">
                            เลือกธีมการแสดงผลที่คุณต้องการ
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">ธีมปัจจุบัน:</span>
                        <span className="text-sm font-medium">
                            {theme === 'light' ? 'สว่าง' : 
                             theme === 'dark' ? 'มืด' : 'ตามระบบ'}
                        </span>
                    </div>
                </div>

                {/* Theme Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            เลือกธีม
                        </CardTitle>
                        <CardDescription>
                            เลือกธีมการแสดงผลที่คุณต้องการ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Theme Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">ธีม</Label>
                            <RadioGroup
                                value={theme}
                                onValueChange={handleThemeChange}
                                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="light" id="light" />
                                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                                        <Sun className="h-4 w-4" />
                                        สว่าง
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="dark" id="dark" />
                                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                                        <Moon className="h-4 w-4" />
                                        มืด
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="system" id="system" />
                                    <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                                        <Monitor className="h-4 w-4" />
                                        ตามระบบ
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
