import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'textarea' | 'select';
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    options?: Array<{ value: string; label: string }>;
    rows?: number;
    className?: string;
    helpText?: string;
}

export function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    error,
    options = [],
    rows = 3,
    className = '',
    helpText
}: FormFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
        onChange(newValue);
    };

    const handleSelectChange = (newValue: string) => {
        onChange(newValue);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={name}>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            
            {type === 'textarea' ? (
                <Textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="mt-1"
                    rows={rows}
                    required={required}
                />
            ) : type === 'select' ? (
                <Select
                    value={value.toString()}
                    onValueChange={handleSelectChange}
                >
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="mt-1"
                    required={required}
                />
            )}
            
            {helpText && (
                <p className="text-xs text-muted-foreground mt-1">
                    {helpText}
                </p>
            )}
            
            {error && (
                <p className="text-sm text-red-600 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
