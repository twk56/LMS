import { usePage } from '@inertiajs/react';
import { CheckCircle, X, XCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { flash } = usePage().props as any;

    return (
        <div className="flex flex-1 flex-col">
            {/* Flash Messages */}
            {flash?.success && (
                <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        {flash.success}
                    </AlertDescription>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-auto p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        onClick={() => {
                            // Clear flash message
                            window.history.replaceState(
                                { ...window.history.state, flash: { ...flash, success: null } },
                                ''
                            );
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            {flash?.error && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                        {flash.error}
                    </AlertDescription>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-auto p-0 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                        onClick={() => {
                            // Clear flash message
                            window.history.replaceState(
                                { ...window.history.state, flash: { ...flash, error: null } },
                                ''
                            );
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            {/* Main Content */}
            {children}
        </div>
    );
}
