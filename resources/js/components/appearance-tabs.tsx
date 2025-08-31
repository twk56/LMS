import { useAppearance } from '@/hooks/use-appearance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Palette, Layout, MousePointer, Eye, Type } from 'lucide-react';

export function AppearanceTabs() {
    const { appearance, updateAppearance, resetSettings } = useAppearance();

    return (
        <Tabs defaultValue="theme" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="theme" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Layout
                </TabsTrigger>
                <TabsTrigger value="accessibility" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Accessibility
                </TabsTrigger>
                <TabsTrigger value="typography" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typography
                </TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Theme Settings</CardTitle>
                        <CardDescription>
                            Customize the appearance of your application
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Theme Mode</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={appearance.theme === 'light' ? 'default' : 'outline'}
                                    onClick={() => updateAppearance({ theme: 'light' })}
                                    className="flex items-center gap-2"
                                >
                                    <Sun className="h-4 w-4" />
                                    Light
                                </Button>
                                <Button
                                    variant={appearance.theme === 'dark' ? 'default' : 'outline'}
                                    onClick={() => updateAppearance({ theme: 'dark' })}
                                    className="flex items-center gap-2"
                                >
                                    <Moon className="h-4 w-4" />
                                    Dark
                                </Button>
                                <Button
                                    variant={appearance.theme === 'system' ? 'default' : 'outline'}
                                    onClick={() => updateAppearance({ theme: 'system' })}
                                    className="flex items-center gap-2"
                                >
                                    <Monitor className="h-4 w-4" />
                                    System
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color-scheme">Color Scheme</Label>
                            <Select
                                value={appearance.colorScheme}
                                onValueChange={(value) => updateAppearance({ colorScheme: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blue">Blue</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="purple">Purple</SelectItem>
                                    <SelectItem value="orange">Orange</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Layout Settings</CardTitle>
                        <CardDescription>
                            Configure the layout and navigation of your application
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sidebar">Sidebar</Label>
                            <Select
                                value={appearance.sidebar}
                                onValueChange={(value) => updateAppearance({ sidebar: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expanded">Expanded</SelectItem>
                                    <SelectItem value="collapsed">Collapsed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="navigation">Navigation</Label>
                            <Select
                                value={appearance.navigation}
                                onValueChange={(value) => updateAppearance({ navigation: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sidebar">Sidebar</SelectItem>
                                    <SelectItem value="top">Top</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="density">Density</Label>
                            <Select
                                value={appearance.density}
                                onValueChange={(value) => updateAppearance({ density: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="comfortable">Comfortable</SelectItem>
                                    <SelectItem value="compact">Compact</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Accessibility Settings</CardTitle>
                        <CardDescription>
                            Improve accessibility and user experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                                <p className="text-sm text-muted-foreground">
                                    Reduce animations and transitions
                                </p>
                            </div>
                            <Switch
                                id="reduced-motion"
                                checked={appearance.reducedMotion}
                                onCheckedChange={(checked) => updateAppearance({ reducedMotion: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="high-contrast">High Contrast</Label>
                                <p className="text-sm text-muted-foreground">
                                    Increase contrast for better visibility
                                </p>
                            </div>
                            <Switch
                                id="high-contrast"
                                checked={appearance.highContrast}
                                onCheckedChange={(checked) => updateAppearance({ highContrast: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Typography Settings</CardTitle>
                        <CardDescription>
                            Customize text size and readability
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="font-size">Font Size</Label>
                            <Select
                                value={appearance.fontSize}
                                onValueChange={(value) => updateAppearance({ fontSize: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <div className="flex justify-end">
                <Button variant="outline" onClick={resetSettings}>
                    Reset to Defaults
                </Button>
            </div>
        </Tabs>
    );
}
