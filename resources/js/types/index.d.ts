import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Course {
    id: number;
    title: string;
    description?: string;
    image?: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface Lesson {
    id: number;
    title: string;
    description?: string;
    content?: string;
    order: number;
    course_id: number;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface LessonFile {
    id: number;
    name: string;
    original_name: string;
    file_path: string;
    file_type: string;
    mime_type: string;
    file_size: number;
    description?: string;
    order: number;
    is_active: boolean;
    lesson_id: number;
    url: string;
    formatted_size: string;
    icon: string;
    created_at: string;
    updated_at: string;
}
