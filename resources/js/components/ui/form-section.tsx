import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}
