import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Award, Calendar, Target, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'หน้าหลัก',
        href: '/dashboard',
    },
    {
        title: 'ใบประกาศนียบัตร',
        href: '/certificates',
    },
];

interface Certificate {
    id: number;
    certificate_number: string;
    final_score: number;
    issued_at: string;
    expires_at: string | null;
    is_valid: boolean;
    course: {
        id: number;
        title: string;
        description: string | null;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface CertificateShowProps {
    certificate: Certificate;
}

export default function CertificateShow({ certificate }: CertificateShowProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = () => {
        if (!certificate.is_valid) {
            return <Badge variant="destructive">หมดอายุ</Badge>;
        }
        if (certificate.expires_at && new Date(certificate.expires_at) < new Date()) {
            return <Badge variant="destructive">หมดอายุ</Badge>;
        }
        return <Badge variant="default">ใช้งานได้</Badge>;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`ใบประกาศนียบัตร - ${certificate.course.title}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('certificates.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                กลับ
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">ใบประกาศนียบัตร</h1>
                            <p className="text-muted-foreground">
                                {certificate.course.title}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={route('certificates.download', certificate.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            ดาวน์โหลด PDF
                        </Link>
                    </Button>
                </div>

                {/* Certificate Content */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        {/* Main Certificate */}
                        <Card className="border-2 border-dashed border-primary/20">
                            <CardContent className="p-8">
                                <div className="text-center space-y-6">
                                    {/* Header */}
                                    <div className="space-y-2">
                                        <div className="flex justify-center">
                                            <Award className="h-16 w-16 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-primary">ใบประกาศนียบัตร</h2>
                                        <p className="text-muted-foreground">Certificate of Completion</p>
                                    </div>

                                    {/* Recipient */}
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">มอบให้แก่</p>
                                        <h3 className="text-xl font-semibold">{certificate.user.name}</h3>
                                        <p className="text-sm text-muted-foreground">{certificate.user.email}</p>
                                    </div>

                                    {/* Course */}
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">ได้เรียนจบหลักสูตร</p>
                                        <h4 className="text-lg font-medium">{certificate.course.title}</h4>
                                        {certificate.course.description && (
                                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                                {certificate.course.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Score */}
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">คะแนนรวม</p>
                                        <div className={`text-4xl font-bold ${getScoreColor(certificate.final_score)}`}>
                                            {certificate.final_score.toFixed(1)}%
                                        </div>
                                    </div>

                                    {/* Certificate Number */}
                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            เลขที่: {certificate.certificate_number}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">สถานะ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">สถานะ</span>
                                        {getStatusBadge()}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">คะแนน</span>
                                        <span className={`font-medium ${getScoreColor(certificate.final_score)}`}>
                                            {certificate.final_score.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">วันที่</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">ออกเมื่อ</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(certificate.issued_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {certificate.expires_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">หมดอายุ</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(certificate.expires_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">การดำเนินการ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Button asChild className="w-full">
                                        <Link href={route('certificates.download', certificate.id)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            ดาวน์โหลด PDF
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href={route('courses.show', certificate.course.id)}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            ดูหลักสูตร
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
