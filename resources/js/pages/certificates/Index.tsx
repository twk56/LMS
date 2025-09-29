import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Award, Calendar, BookOpen } from 'lucide-react';

interface Certificate {
    id: number;
    course_title: string;
    course_id: number;
    issued_at: string;
    certificate_url: string;
    status: string;
}

interface Props {
    certificates: Certificate[];
    error?: string;
}

export default function CertificatesIndex({ certificates, error }: Props) {
    if (error) {
        return (
            <AppLayout>
                <Head title="ใบรับรอง" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'issued':
                return <Badge className="bg-green-100 text-green-800">ออกแล้ว</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">รอดำเนินการ</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="ใบรับรอง" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">ใบรับรองของฉัน</h1>
                        <p className="text-gray-600 mt-1">ใบรับรองที่ได้รับจากการเรียนหลักสูตร</p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ใบรับรองทั้งหมด</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{certificates.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ออกแล้ว</CardTitle>
                            <Award className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {certificates.filter(c => c.status === 'issued').length}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
                            <Award className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {certificates.filter(c => c.status === 'pending').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Certificates List */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการใบรับรอง</CardTitle>
                        <CardDescription>
                            ใบรับรองทั้งหมด {certificates.length} รายการ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {certificates.length === 0 ? (
                            <div className="text-center py-8">
                                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีใบรับรอง</h3>
                                <p className="text-gray-500 mb-4">เริ่มเรียนหลักสูตรเพื่อรับใบรับรอง</p>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    ดูหลักสูตร
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {certificates.map((certificate) => (
                                    <div key={certificate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">{certificate.course_title}</h3>
                                                {getStatusBadge(certificate.status)}
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>ออกเมื่อ: {new Date(certificate.issued_at).toLocaleDateString('th-TH')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {certificate.status === 'issued' && certificate.certificate_url && (
                                                <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    ดาวน์โหลด
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
