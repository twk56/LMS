import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';

interface FormActionsProps {
    onCancel: () => void;
    onSubmit: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    isProcessing?: boolean;
    processingLabel?: string;
    showCancel?: boolean;
    className?: string;
}

export function FormActions({
    onCancel,
    onSubmit,
    submitLabel = 'บันทึก',
    cancelLabel = 'ยกเลิก',
    isProcessing = false,
    processingLabel = 'กำลังบันทึก...',
    showCancel = true,
    className = ''
}: FormActionsProps) {
    return (
        <div className={`flex justify-end gap-4 pt-6 ${className}`}>
            {showCancel && (
                <Button variant="outline" onClick={onCancel}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {cancelLabel}
                </Button>
            )}
            <Button onClick={onSubmit} disabled={isProcessing}>
                <Save className="mr-2 h-4 w-4" />
                {isProcessing ? processingLabel : submitLabel}
            </Button>
        </div>
    );
}
