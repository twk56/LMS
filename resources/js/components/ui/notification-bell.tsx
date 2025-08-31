import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';

interface NotificationBellProps {
    unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                asChild
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative p-2"
                aria-label={`การแจ้งเตือน ${unreadCount > 0 ? `${unreadCount} รายการที่ยังไม่ได้อ่าน` : 'ไม่มีการแจ้งเตือนใหม่'}`}
            >
                <Link href="/notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                            aria-label={`${unreadCount} การแจ้งเตือนที่ยังไม่ได้อ่าน`}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Link>
            </Button>
            
            {/* Tooltip - Hidden on mobile */}
            {isHovered && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border rounded-md shadow-lg p-2 z-50 hidden md:block">
                    <div className="text-sm font-medium mb-1">การแจ้งเตือน</div>
                    <div className="text-xs text-muted-foreground">
                        {unreadCount > 0 
                            ? `คุณมี ${unreadCount} การแจ้งเตือนที่ยังไม่ได้อ่าน`
                            : 'ไม่มีการแจ้งเตือนใหม่'
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
