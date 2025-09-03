import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from './components/theme-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">We're sorry, but something unexpected happened. Please try again.</p>
                <button
                    onClick={resetErrorBoundary}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        // Clear any existing content
        if ((el as any)._reactRootContainer) {
            (el as any)._reactRootContainer.unmount();
            delete (el as any)._reactRootContainer;
        }

        const root = createRoot(el);

        root.render(
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ThemeProvider>
                    <App {...props} />
                </ThemeProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: 'hsl(var(--primary))',
        showSpinner: true,
        delay: 250,
    },
});

// Theme initialization is now handled by the useAppearance hook in components
