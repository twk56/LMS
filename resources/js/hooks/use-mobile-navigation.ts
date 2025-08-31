import { useState, useEffect } from 'react';

export function useMobileNavigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close mobile menu when screen size changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-mobile-menu]') && !target.closest('[data-mobile-trigger]')) {
                setIsMobileMenuOpen(false);
            }
            if (!target.closest('[data-sidebar]') && !target.closest('[data-sidebar-trigger]')) {
                setIsSidebarOpen(false);
            }
        };

        if (isMobileMenuOpen || isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen, isSidebarOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen || isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen, isSidebarOpen]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const openMobileMenu = () => setIsMobileMenuOpen(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        // Dispatch custom event for sidebar communication
        window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
            detail: { isOpen: !isSidebarOpen } 
        }));
    };
    const closeSidebar = () => setIsSidebarOpen(false);
    const openSidebar = () => setIsSidebarOpen(true);

    return {
        isMobileMenuOpen,
        isSidebarOpen,
        toggleMobileMenu,
        closeMobileMenu,
        openMobileMenu,
        toggleSidebar,
        closeSidebar,
        openSidebar,
    };
}
