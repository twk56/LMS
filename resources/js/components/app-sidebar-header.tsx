import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItemType[];
    onMobileMenuToggle?: () => void;
}

export function AppSidebarHeader({ breadcrumbs = [], onMobileMenuToggle }: AppSidebarHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-4 sm:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden -ml-1"
                    onClick={onMobileMenuToggle}
                    data-sidebar-trigger
                    aria-label="เปิดเมนู"
                >
                    <Menu className="h-5 w-5" />
                </Button>
                
                {/* Desktop Sidebar Trigger */}
                <div className="hidden lg:block">
                    <SidebarTrigger className="-ml-1" />
                </div>
                
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
