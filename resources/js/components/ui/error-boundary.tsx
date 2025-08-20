import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by boundary:', error, errorInfo);
        }
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full space-y-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
                            <AlertDescription>
                                เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Button onClick={this.resetError} className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                ลองใหม่
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => window.location.reload()} 
                                className="w-full"
                            >
                                รีเฟรชหน้า
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-xs text-muted-foreground">
                                <summary className="cursor-pointer">รายละเอียดข้อผิดพลาด</summary>
                                <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook for functional components
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    const handleError = React.useCallback((error: Error) => {
        setError(error);
        console.error('Error caught by hook:', error);
    }, []);

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
}

// Error display component
export function ErrorDisplay({ 
    error, 
    onRetry, 
    title = 'เกิดข้อผิดพลาด',
    description = 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
}: {
    error: Error | string;
    onRetry?: () => void;
    title?: string;
    description?: string;
}) {
    return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1 space-y-2">
                    <h3 className="font-medium text-destructive">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    {onRetry && (
                        <Button onClick={onRetry} size="sm" variant="outline">
                            ลองใหม่
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ErrorBoundary;
