import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationToastProps {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    duration?: number;
    onClose: (id: string) => void;
}

export function NotificationToast({ 
    id, 
    title, 
    message, 
    type, 
    duration = 5000, 
    onClose 
}: NotificationToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose(id);
        }, 300);
    }, [id, onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, handleClose]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getAriaLabel = () => {
        switch (type) {
            case 'success':
                return 'การแจ้งเตือนสำเร็จ';
            case 'warning':
                return 'การแจ้งเตือนคำเตือน';
            case 'error':
                return 'การแจ้งเตือนข้อผิดพลาด';
            default:
                return 'การแจ้งเตือนข้อมูล';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed top-4 right-4 w-80 p-4 rounded-lg border shadow-lg transition-all duration-300 z-50 md:max-w-sm",
                getBackgroundColor(),
                isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
            )}
            role="alert"
            aria-label={getAriaLabel()}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-gray-600">
                        {message}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    aria-label="ปิดการแจ้งเตือน"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

interface NotificationContainerProps {
    notifications: Array<{
        id: string;
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        duration?: number;
    }>;
    onClose: (id: string) => void;
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
    return (
        <div className="fixed top-4 right-4 space-y-2 z-50">
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    style={{ 
                        transform: `translateY(${index * 80}px)`,
                        zIndex: 1000 - index 
                    }}
                >
                    <NotificationToast
                        {...notification}
                        onClose={onClose}
                    />
                </div>
            ))}
        </div>
    );
}
