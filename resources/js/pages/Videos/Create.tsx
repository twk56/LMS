import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';

interface CreateVideoProps {
  courses: Array<{ id: number; title: string }>;
  lessons: Array<{ id: number; title: string; course_id: number }>;
}

export default function CreateVideo({ courses, lessons }: CreateVideoProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    course_id: '',
    lesson_id: '',
    video: null as File | null,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Invalid file type. Please select a video file.');
        return;
      }

      // Validate file size (100GB max)
      const maxSize = 100 * 1024 * 1024 * 1024; // 100GB in bytes
      if (file.size > maxSize) {
        setErrorMessage('File size too large. Maximum size is 100GB.');
        return;
      }

      setSelectedFile(file);
      setData('video', file);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setErrorMessage('Please select a video file.');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await post('/videos', {
        onSuccess: () => {
          setUploadStatus('success');
          setUploadProgress(100);
          clearInterval(progressInterval);
        },
        onError: (errors) => {
          setUploadStatus('error');
          setErrorMessage(Object.values(errors).flat().join(', '));
          clearInterval(progressInterval);
        },
      });
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Upload failed. Please try again.');
      clearInterval(progressInterval);
    }
  };

  const filteredLessons = lessons.filter(lesson => 
    !data.course_id || lesson.course_id === parseInt(data.course_id)
  );

  return (
    <>
      <Head title="Upload Video - LMS Enterprise" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Video</h1>
            <p className="text-gray-600">
              Upload and manage your video content with enterprise-grade streaming capabilities.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Upload
              </CardTitle>
              <CardDescription>
                Upload your video file and configure streaming settings. Supported formats: MP4, AVI, MOV, WMV, FLV, WebM.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="video">Video File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="video"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="video" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {selectedFile ? selectedFile.name : 'Click to select video file'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedFile 
                          ? `Size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : 'Maximum file size: 100GB'
                        }
                      </p>
                    </label>
                  </div>
                  {errors.video && (
                    <p className="text-sm text-red-600">{errors.video}</p>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {/* Upload Status */}
                {uploadStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Video uploaded successfully! Your video is now being processed for streaming.
                    </AlertDescription>
                  </Alert>
                )}

                {uploadStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Video Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={e => setData('title', e.target.value)}
                      placeholder="Enter video title"
                      required
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select value={data.course_id} onValueChange={value => setData('course_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No course</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.course_id && (
                      <p className="text-sm text-red-600">{errors.course_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson">Lesson</Label>
                  <Select value={data.lesson_id} onValueChange={value => setData('lesson_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No lesson</SelectItem>
                      {filteredLessons.map(lesson => (
                        <SelectItem key={lesson.id} value={lesson.id.toString()}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.lesson_id && (
                    <p className="text-sm text-red-600">{errors.lesson_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    placeholder="Enter video description"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={processing || !selectedFile || uploadStatus === 'uploading'}
                    className="min-w-[120px]"
                  >
                    {processing || uploadStatus === 'uploading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
                      </>
                    ) : (
                      'Upload Video'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Enterprise Features Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Enterprise Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Secure S3 Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>CloudFront CDN</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Auto Transcoding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Signed URLs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Multi-format Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Progress Tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
