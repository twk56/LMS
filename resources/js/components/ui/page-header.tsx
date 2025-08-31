import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    backUrl?: string;
    backLabel?: string;
    action?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    backUrl,
    backLabel = 'กลับ',
    action,
    className = ''
}: PageHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            <div className="flex items-center gap-4">
                {backUrl && (
                    <Button variant="ghost" size="sm" asChild>
                        <a href={backUrl}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {backLabel}
                        </a>
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
