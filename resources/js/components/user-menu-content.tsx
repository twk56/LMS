import { Link } from '@inertiajs/react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Bell, HelpCircle } from 'lucide-react';

interface UserMenuContentProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const mobileNav = useMobileNavigation();
    
    // Create a proper cleanup function
    const cleanup = () => {
        mobileNav.closeMobileMenu();
        mobileNav.closeSidebar();
    };

    return (
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
                <Link className="user-menu-item" href="/notifications" as="button" onClick={cleanup}>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
                <Link className="user-menu-item" href="/help" as="button" onClick={cleanup}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
                <Link className="user-menu-item" href={route('profile.edit')} as="button" onClick={cleanup}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
                <Link className="user-menu-item" href="/settings" as="button" onClick={cleanup}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
                <Link href={route('logout')} method="post" as="button" className="user-menu-item">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
}
