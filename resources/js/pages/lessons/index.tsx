import { Head, Link } from '@inertiajs/react';
import { Plus, BookOpen, Video, FileText, Download, Clock, Users, CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Lesson {
    id: number;
    title: string;
    description: string;
    content_type: string;
    order: number;
    status: 'draft' | 'published';
    created_at: string;
    course: {
        id: number;
        title: string;
    };
    creator: {
        id: number;
        name: string;
    };
}

interface PageProps {
    lessons: Lesson[];
    stats: {
        total_lessons: number;
        published_lessons: number;
        draft_lessons: number;
        video_lessons: number;
        document_lessons: number;
    };
    isAdmin: boolean;
    course?: {
        id: number;
        title: string;
    };
}

export default function LessonsIndex({ lessons, stats, isAdmin, course }: PageProps) {
    const getContentTypeIcon = (contentType: string) => {
        switch (contentType) {
            case 'video':
                return <Video className="h-4 w-4" />;
            case 'document':
                return <FileText className="h-4 w-4" />;
            case 'resource':
                return <Download className="h-4 w-4" />;
            default:
                return <BookOpen className="h-4 w-4" />;
        }
    };

    const getContentTypeLabel = (contentType: string) => {
        switch (contentType) {
            case 'video':
                return 'Video';
            case 'document':
                return 'Document';
            case 'resource':
                return 'Resource';
            default:
                return 'Text';
        }
    };

    return (
        <AppLayout>
            <Head title="Lessons" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {course ? `${course.title} - Lessons` : 'All Lessons'}
                        </h1>
                        <p className="text-muted-foreground">
                            {course 
                                ? 'Manage and organize your course content'
                                : 'Browse all available lessons across courses'
                            }
                        </p>
                    </div>
                    {isAdmin && course && (
                        <Button asChild>
                            <Link href={route('courses.lessons.create', course.id)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Lesson
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_lessons}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.published_lessons}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.draft_lessons}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Video Lessons</CardTitle>
                            <Video className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.video_lessons}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documents</CardTitle>
                            <FileText className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.document_lessons}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lessons List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Lessons</CardTitle>
                        <CardDescription>
                            Browse and manage all lessons across your courses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lessons.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No lessons found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {isAdmin 
                                        ? 'Create your first lesson to get started'
                                        : 'No lessons are available yet'
                                    }
                                </p>
                                {isAdmin && course && (
                                    <Button asChild>
                                        <Link href={`/courses/${course.id}/lessons/create`}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create First Lesson
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                                {getContentTypeIcon(lesson.content_type)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{lesson.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {lesson.course?.title || 'No Course'} • {getContentTypeLabel(lesson.content_type)}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
                                                        {lesson.status === 'published' ? 'Published' : 'Draft'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Lesson {lesson.order}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/lessons/${lesson.id}`}>
                                                    View
                                                </Link>
                                            </Button>
                                            {isAdmin && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/lessons/${lesson.id}/edit`}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
