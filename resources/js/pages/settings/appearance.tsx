import { Head } from '@inertiajs/react';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { useAppearance } from '@/hooks/use-appearance';
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
    const { settings, updateSettings } = useAppearance();
    const [isLoading, setIsLoading] = useState(false);

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        updateSettings({ theme });
    };

    const handleColorSchemeChange = (colorScheme: 'blue' | 'green' | 'purple' | 'orange') => {
        updateSettings({ colorScheme });
    };

    const handleReducedMotionChange = (reducedMotion: boolean) => {
        updateSettings({ reducedMotion });
    };

    const handleHighContrastChange = (highContrast: boolean) => {
        updateSettings({ highContrast });
    };

    const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
        updateSettings({ fontSize });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Appearance settings saved:', settings);
        } catch (error) {
            console.error('Error saving appearance settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const colorSchemes = [
        { value: 'blue', name: 'น้ำเงิน', color: 'hsl(221.2 83.2% 53.3%)', darkColor: 'hsl(217.2 91.2% 59.8%)' },
        { value: 'green', name: 'เขียว', color: 'hsl(142.1 76.2% 36.3%)', darkColor: 'hsl(142.1 76.2% 36.3%)' },
        { value: 'purple', name: 'ม่วง', color: 'hsl(262.1 83.3% 57.8%)', darkColor: 'hsl(263.4 70% 50.4%)' },
        { value: 'orange', name: 'ส้ม', color: 'hsl(24.6 95% 53.1%)', darkColor: 'hsl(20.5 90.2% 48.2%)' },
    ];

    const fontSizes = [
        { value: 'small', name: 'เล็ก', size: '14px' },
        { value: 'medium', name: 'กลาง', size: '16px' },
        { value: 'large', name: 'ใหญ่', size: '18px' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="การตั้งค่าการแสดงผล" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">การตั้งค่าการแสดงผล</h1>
                        <p className="text-muted-foreground">
                            ปรับแต่งการแสดงผลและธีมของแอปพลิเคชัน
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">ธีมปัจจุบัน:</span>
                        <span className="text-sm font-medium">
                            {settings.theme === 'light' ? 'สว่าง' : 
                             settings.theme === 'dark' ? 'มืด' : 'ตามระบบ'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Theme Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                ธีมและการแสดงผล
                            </CardTitle>
                            <CardDescription>
                                เลือกธีมและโหมดการแสดงผลที่คุณต้องการ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Theme Selection */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">ธีม</Label>
                                <RadioGroup
                                    value={settings.theme}
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

                            <Separator />

                            {/* Color Scheme */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">สีหลัก</Label>
                                <RadioGroup
                                    value={settings.colorScheme}
                                    onValueChange={handleColorSchemeChange}
                                    className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                                >
                                    {colorSchemes.map((scheme) => (
                                        <div key={scheme.value} className="flex items-center space-x-2">
                                            <RadioGroupItem value={scheme.value} id={scheme.value} />
                                            <Label 
                                                htmlFor={scheme.value} 
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <div 
                                                    className="w-4 h-4 rounded-full border-2 border-border transition-colors"
                                                    style={{ 
                                                        backgroundColor: settings.theme === 'dark' ? scheme.darkColor : scheme.color 
                                                    }}
                                                />
                                                {scheme.name}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <Separator />

                            {/* Font Size */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">ขนาดตัวอักษร</Label>
                                <RadioGroup
                                    value={settings.fontSize}
                                    onValueChange={handleFontSizeChange}
                                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                                >
                                    {fontSizes.map((size) => (
                                        <div key={size.value} className="flex items-center space-x-2">
                                            <RadioGroupItem value={size.value} id={size.value} />
                                            <Label 
                                                htmlFor={size.value} 
                                                className="cursor-pointer"
                                                style={{ fontSize: size.size }}
                                            >
                                                {size.name}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accessibility Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                การเข้าถึง
                            </CardTitle>
                            <CardDescription>
                                ปรับแต่งการตั้งค่าสำหรับการเข้าถึงที่ดีขึ้น
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="reduced-motion">ลดการเคลื่อนไหว</Label>
                                    <p className="text-sm text-muted-foreground">
                                        ลดการเคลื่อนไหวและแอนิเมชันสำหรับผู้ที่มีความไวต่อการเคลื่อนไหว
                                    </p>
                                </div>
                                <Switch
                                    id="reduced-motion"
                                    checked={settings.reducedMotion}
                                    onCheckedChange={handleReducedMotionChange}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="high-contrast">ความคมชัดสูง</Label>
                                    <p className="text-sm text-muted-foreground">
                                        เพิ่มความคมชัดของสีสำหรับการมองเห็นที่ดีขึ้น
                                    </p>
                                </div>
                                <Switch
                                    id="high-contrast"
                                    checked={settings.highContrast}
                                    onCheckedChange={handleHighContrastChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ตัวอย่างการแสดงผล</CardTitle>
                            <CardDescription>
                                ดูตัวอย่างการแสดงผลตามการตั้งค่าปัจจุบัน
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 border rounded-lg bg-card transition-colors">
                                <h3 className="text-lg font-semibold mb-2">ตัวอย่างหัวข้อ</h3>
                                <p className="text-muted-foreground mb-4">
                                    นี่คือตัวอย่างข้อความที่จะแสดงตามการตั้งค่าปัจจุบันของคุณ
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm">ปุ่มตัวอย่าง</Button>
                                    <Button size="sm" variant="outline">ปุ่มตัวอย่าง 2</Button>
                                </div>
                                <div className="mt-4 p-3 bg-muted rounded-md">
                                    <p className="text-sm text-muted-foreground">
                                        ตัวอย่างพื้นหลัง muted
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
