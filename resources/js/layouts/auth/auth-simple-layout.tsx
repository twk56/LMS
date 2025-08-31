import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative w-full max-w-md mx-auto">
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <Link 
                            href={route('home')} 
                            className="inline-flex flex-col items-center gap-3 group transition-transform duration-200 hover:scale-105"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                                <AppLogoIcon className="size-8 fill-current text-primary" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        Secure password reset powered by{' '}
                        <span className="font-medium text-primary">Laravel</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
