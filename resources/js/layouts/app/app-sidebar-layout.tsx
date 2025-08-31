import AppContent from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { NotificationContainer } from '@/components/ui/notification-toast';
import { ErrorBoundary } from '@/components/error-boundary';
import { useNotifications } from '@/hooks/use-notifications';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage<SharedData>();
    const { notifications, removeNotification, showSuccess, showError } = useNotifications();
    const { toggleSidebar } = useMobileNavigation();
    const previousFlash = useRef<{ success?: string; error?: string }>({});
    
    useEffect(() => { 
        const currentFlash = props.flash || {};
        
        // ตรวจสอบว่ามี flash message ใหม่หรือไม่
        if (currentFlash.success && currentFlash.success !== previousFlash.current.success) {
            showSuccess('สำเร็จ', currentFlash.success);
        }
        if (currentFlash.error && currentFlash.error !== previousFlash.current.error) {
            showError('ข้อผิดพลาด', currentFlash.error);
        }
        
        // อัปเดต previous flash
        previousFlash.current = currentFlash;
    }, [props.flash?.success, props.flash?.error, showSuccess, showError]);

    return (
        <ErrorBoundary>
            <AppShell variant="sidebar">
                <div className="flex h-screen w-full">
                    {/* Mobile Overlay */}
                    <div 
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        style={{ display: 'none' }}
                        data-sidebar-overlay
                    />
                    
                    <AppSidebar />
                    <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                        <AppSidebarHeader 
                            breadcrumbs={breadcrumbs} 
                            onMobileMenuToggle={toggleSidebar}
                        />
                        <AppContent>
                            {children}
                        </AppContent>
                    </div>
                </div>
                
                {/* Notification Container */}
                <NotificationContainer 
                    notifications={notifications} 
                    onClose={removeNotification} 
                />
            </AppShell>
        </ErrorBoundary>
    );
}
