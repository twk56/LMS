export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'student';
    avatar?: string;
    email_verified_at?: string;
}

export interface CourseCategory {
    id: number;
    name: string;
    color: string;
    description?: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    image?: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
    creator: User;
    category?: CourseCategory;
    lessons_count?: number;
    students_count?: number;
    progress_percentage?: number;
    is_completed?: boolean;
    lessons?: Lesson[];
}

export interface Lesson {
    id: number;
    title: string;
    content: string;
    content_type: string;
    order: number;
    status: 'draft' | 'published';
    youtube_url?: string;
    course_id: number;
    created_at: string;
    updated_at: string;
    course?: Course;
}

export interface LessonProgress {
    id: number;
    user_id: number;
    lesson_id: number;
    status: 'not_started' | 'in_progress' | 'completed';
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
    lesson?: Lesson;
}

export interface DashboardStats {
    // Admin stats
    total_courses?: number;
    total_users?: number;
    completed_enrollments?: number;
    completion_rate?: number;
    total_lessons?: number;
    completed_lessons?: number;
    lesson_completion_rate?: number;
    
    // Student stats
    enrolled_courses?: number;
    completed_courses?: number;
    course_completion_rate?: number;
    
    // Additional data from PerformanceOptimizationService
    enrolled_courses_data?: Course[];
    recent_completions?: LessonProgress[];
    upcoming_lessons?: UpcomingLesson[];
    recent_activities?: RecentActivity[];
}

export interface RecentActivity {
    course_title: string;
    lesson_title: string;
    completed_at: string;
    created_at: string;
    user_name: string;
}

export interface UpcomingLesson {
    lesson_title: string;
    course_title: string;
    order: number;
}

export interface CourseStats {
    id: number;
    title: string;
    status: string;
    created_at: string;
    category_name?: string;
    students_count: number;
}

export interface UserStats {
    total_users: number;
    admin_users: number;
    student_users: number;
    active_users: number;
    new_users_this_month: number;
}

export interface DashboardProps {
    user: User;
    isAdmin: boolean;
    stats: DashboardStats;
    enrolledCourses?: Course[];
    recentCompletions?: LessonProgress[];
    upcomingLessons?: UpcomingLesson[];
    recentActivities?: RecentActivity[];
    courseStats?: CourseStats[];
    userStats?: UserStats;
}
