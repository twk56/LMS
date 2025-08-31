import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Home, 
    BookOpen, 
    FileText, 
    Settings, 
    Bell, 
    ChevronLeft,
    ChevronRight,
    Search,
    Sparkles,
    Plus,
    MoreHorizontal,
    LogOut,
    User,
    Lock,
    Layers
} from 'lucide-react';

import AppLogo from './app-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: unknown;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    description?: string;
    isAdminOnly?: boolean;
}

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile sidebar when screen size changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-sidebar]') && !target.closest('[data-sidebar-trigger]')) {
                setIsMobileOpen(false);
            }
        };

        if (isMobileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileOpen]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileOpen]);

    // Listen for sidebar toggle events from header
    useEffect(() => {
        const handleSidebarToggle = (event: CustomEvent) => {
            setIsMobileOpen(event.detail.isOpen);
        };

        window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
        return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    }, []);

    const isAdmin = auth.user.role === 'admin';

    const navigationItems: NavigationItem[] = useMemo(() => [
        // Main Dashboard
        {
            name: 'หน้าหลัก',
            href: '/dashboard',
            icon: Home,
            description: 'ภาพรวมและสถิติ'
        },

        // Learning Management
        {
            name: 'หลักสูตร',
            href: '/courses',
            icon: BookOpen,
            description: 'จัดการหลักสูตรของคุณ'
        },

        {
            name: 'บทเรียน',
            href: '/lessons',
            icon: FileText,
            description: 'เนื้อหาบทเรียนและสื่อการสอน'
        },

        {
            name: 'หมวดหมู่',
            href: '/categories',
            icon: Layers,
            description: 'จัดการหมวดหมู่หลักสูตร'
        },

        // Communication
        {
            name: 'การแจ้งเตือน',
            href: '/notifications',
            icon: Bell,
            badge: '3',
            description: 'ข้อความจากระบบ'
        },

        // System & Settings
        {
            name: 'ตั้งค่า',
            href: '/settings/profile',
            icon: Settings,
            description: 'การตั้งค่าระบบ'
        }
    ], []);

    // Filter items based on user role and search query
    const filteredItems = useMemo(() => {
        return navigationItems.filter(item => {
            // Check role-based access
            if (item.isAdminOnly && !isAdmin) return false;
            
            // Check search query
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            return !searchQuery || matchesSearch;
        });
    }, [navigationItems, isAdmin, searchQuery]);

    const handleLogout = useCallback(async () => {
        try {
            await router.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
            // Fallback: redirect to login page
            window.location.href = '/login';
        }
    }, []);

    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleSearchFocus = useCallback(() => {
        setIsSearchFocused(true);
    }, []);

    const handleSearchBlur = useCallback(() => {
        setIsSearchFocused(false);
    }, []);

    const handleItemHover = useCallback((itemName: string | null) => {
        setHoveredItem(itemName);
    }, []);

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}
            
            <aside 
                data-sidebar
                className={cn(
                    "flex-shrink-0 h-screen transition-all duration-300 ease-in-out overflow-hidden",
                    isCollapsed ? "w-20" : "w-64",
                    "lg:relative lg:translate-x-0", // Desktop: always visible
                    "fixed top-0 left-0 z-40", // Mobile: fixed positioning
                    "transform transition-transform duration-300", // Mobile: transform
                    isMobileOpen ? "translate-x-0" : "-translate-x-full", // Mobile: show/hide
                    "lg:transform-none" // Desktop: no transform
                )}
            >
            <div className="flex h-full flex-col bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border/50 backdrop-blur-sm">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/50 bg-sidebar/80 backdrop-blur-sm">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <AppLogo />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleCollapse}
                        className="h-8 w-8 p-0 hover:bg-sidebar-accent/50 transition-all duration-200"
                        aria-label={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
                        aria-expanded={!isCollapsed}
                    >
                        {isCollapsed ? 
                            <ChevronRight className="h-4 w-4" /> : 
                            <ChevronLeft className="h-4 w-4" />
                        }
                    </Button>
                </div>

                {/* Search */}
                {!isCollapsed && (
                    <div className="p-4 border-b border-sidebar-border/50">
                        <div className="relative group">
                            <Search className={cn(
                                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
                                isSearchFocused ? "text-primary" : "text-muted-foreground"
                            )} />
                            <Input
                                placeholder="ค้นหาเมนู..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                className="pl-9 pr-4 py-2 bg-sidebar/50 border-sidebar-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                                aria-label="ค้นหาเมนู"
                            />
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2" role="navigation" aria-label="เมนูหลัก">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">ไม่พบเมนูที่ค้นหา</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const Icon = item.icon;
                            const isHovered = hoveredItem === item.name;
                            
                            return (
                                <div key={item.name} className="relative">
                                    <Link href={item.href}>
                                        <div
                                            onMouseEnter={() => handleItemHover(item.name)}
                                            onMouseLeave={() => handleItemHover(null)}
                                            className={cn(
                                                "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out cursor-pointer",
                                                "hover:bg-gradient-to-r hover:from-sidebar-accent/50 hover:to-sidebar-accent/30",
                                                "hover:shadow-lg hover:shadow-sidebar-accent/20",
                                                "focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
                                                isCollapsed ? "justify-center" : "justify-start",
                                                isHovered && "scale-105 transform"
                                            )}
                                            role="menuitem"
                                            aria-label={item.description ? `${item.name} - ${item.description}` : item.name}
                                        >
                                            {/* Icon */}
                                            <div className={cn(
                                                "relative transition-all duration-300 ease-out",
                                                isCollapsed ? "mr-0" : "mr-3"
                                            )}>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                                    isHovered 
                                                        ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg" 
                                                        : "bg-sidebar-accent/30 text-sidebar-accent-foreground"
                                                )}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                {isHovered && !isCollapsed && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                                                )}
                                            </div>

                                            {!isCollapsed && (
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{item.name}</span>
                                                        {item.badge && (
                                                            <Badge className="ml-2 bg-primary text-primary-foreground text-xs" aria-label={`${item.badge} รายการใหม่`}>
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs text-sidebar-muted-foreground mt-1 line-clamp-1">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </nav>

                {/* User Profile */}
                {!isCollapsed && (
                    <div className="border-t border-sidebar-border/50 p-4 bg-sidebar/80 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-all duration-200 cursor-pointer group">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                                    <span className="text-sm font-bold text-white" aria-label={`อักษรแรกของชื่อ ${auth.user.name}`}>
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" aria-label="ออนไลน์"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-sidebar-muted-foreground truncate">
                                    {auth.user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้เรียน'}
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="ตัวเลือกเพิ่มเติม"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        {/* Logout Button */}
                        <div className="mt-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                                onClick={handleLogout}
                                aria-label="ออกจากระบบ"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                ออกจากระบบ
                            </Button>
                        </div>
                    </div>
                )}

                {/* Collapsed User Profile */}
                {isCollapsed && (
                    <div className="border-t border-sidebar-border/50 p-4">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                                    <span className="text-sm font-bold text-white" aria-label={`อักษรแรกของชื่อ ${auth.user.name}`}>
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" aria-label="ออนไลน์"></div>
                            </div>
                            
                            {/* Logout Button for Collapsed State */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleLogout}
                                title="ออกจากระบบ"
                                aria-label="ออกจากระบบ"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
        </>
    );
}
