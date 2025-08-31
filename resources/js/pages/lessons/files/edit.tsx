import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, FileText, Video, Image, Music, Archive } from 'lucide-react';
import { type Lesson, type LessonFile } from '@/types';

interface Props {
    lesson: Lesson;
    file: LessonFile;
}

export default function EditLessonFile({ lesson, file }: Props) {
    const [formData, setFormData] = useState({
        name: file.name,
        description: file.description || '',
        file: null as File | null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
        if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
        if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        if (formData.file) {
            submitData.append('file', formData.file);
        }

        router.put(`/lessons/${lesson.id}/files/${file.id}`, submitData, {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (errors: any) => {
                setIsSubmitting(false);
                setError(errors.message || 'Failed to update file');
            },
        });
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        router.delete(`/lessons/${lesson.id}/files/${file.id}`, {
            onError: (errors: any) => {
                setError(errors.message || 'Failed to delete file');
            },
        });
    };

    return (
        <>
            <Head title={`Edit File - ${file.name}`} />
            
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lesson
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit File</CardTitle>
                        <CardDescription>
                            Update file information for "{file.name}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert className="mb-4" variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">File Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Optional description of the file"
                                />
                            </div>

                            <div>
                                <Label htmlFor="file">Replace File (Optional)</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    {getFileIcon(file.mime_type)}
                                    <span className="text-sm text-muted-foreground">{file.original_name}</span>
                                </div>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        file: e.target.files?.[0] || null 
                                    }))}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update File'}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                >
                                    Delete File
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
