import { Head, Link } from '@inertiajs/react';
import { Award, Download, Eye, Calendar, Target } from 'lucide-react';

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
}

interface CertificatesIndexProps {
    certificates: Certificate[];
}

export default function CertificatesIndex({ certificates }: CertificatesIndexProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (certificate: Certificate) => {
        if (!certificate.is_valid) {
            return <Badge variant="destructive">หมดอายุ</Badge>;
        }
        if (certificate.expires_at && new Date(certificate.expires_at) < new Date()) {
            return <Badge variant="destructive">หมดอายุ</Badge>;
        }
        return <Badge variant="default">ใช้งานได้</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ใบประกาศนียบัตร" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">ใบประกาศนียบัตร</h1>
                        <p className="text-muted-foreground">
                            ใบประกาศนียบัตรที่คุณได้รับจากการเรียนจบหลักสูตร
                        </p>
                    </div>
                </div>

                {/* Certificates Grid */}
                <div className="space-y-4">
                    {certificates.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">ยังไม่มีใบประกาศนียบัตร</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    เรียนจบหลักสูตรเพื่อรับใบประกาศนียบัตรของคุณ
                                </p>
                                <Button asChild>
                                    <Link href={route('courses.index')}>
                                        ดูหลักสูตรทั้งหมด
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {certificates.map((certificate) => (
                                <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="line-clamp-2 flex-1">
                                                {certificate.course.title}
                                            </CardTitle>
                                            {getStatusBadge(certificate)}
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {certificate.course.description || 'ไม่มีคำอธิบาย'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-muted-foreground" />
                                                    <span>คะแนน: {certificate.final_score.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>ออกเมื่อ: {formatDate(certificate.issued_at)}</span>
                                                </div>
                                                {certificate.expires_at && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>หมดอายุ: {formatDate(certificate.expires_at)}</span>
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    เลขที่: {certificate.certificate_number}
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Button asChild className="flex-1">
                                                    <Link href={route('certificates.show', certificate.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        ดูใบประกาศ
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('certificates.download', certificate.id)}>
                                                        <Download className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
