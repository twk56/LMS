import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="max-w-md mx-auto mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <span>เกิดข้อผิดพลาด</span>
                        </CardTitle>
                        <CardDescription>
                            เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {this.state.error && (
                                <details className="text-sm text-muted-foreground">
                                    <summary className="cursor-pointer hover:text-foreground">
                                        ดูรายละเอียดข้อผิดพลาด
                                    </summary>
                                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                            <Button onClick={this.handleRetry} className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                ลองใหม่
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}
