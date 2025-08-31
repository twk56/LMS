import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email,
        password: '',
        password_confirmation: '',
        token,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password', {
            onSuccess: () => reset('password', 'password_confirmation'),
            onError: (errors) => {
                console.error('Password reset failed:', errors);
            }
        });
    };

    return (
        <AuthLayout title="Reset Password" description="Enter your new password to complete the reset process">
            <Head title="Reset Password" />

            <div className="w-full max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email Address
                        </Label>
                        <div className="relative">
                            <Input 
                                id="email" 
                                type="email" 
                                value={data.email} 
                                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg bg-background transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                                readOnly 
                                disabled
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-sm text-muted-foreground">✓ Verified</span>
                            </div>
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">
                            New Password
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                className="w-full pl-10 pr-12 py-3 text-base border-2 border-border rounded-lg bg-background transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                placeholder="Enter your new password"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground">
                            Confirm New Password
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? "text" : "password"}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                className="w-full pl-10 pr-12 py-3 text-base border-2 border-border rounded-lg bg-background transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                placeholder="Confirm your new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className="w-full py-3 px-6 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center space-x-2">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                                <span>Resetting Password...</span>
                            </div>
                        ) : (
                            <span>Reset Password</span>
                        )}
                    </Button>
                </form>

                {/* Password Requirements */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Password Requirements:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                            At least 8 characters long
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                            Contains uppercase and lowercase letters
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                            Contains at least one number
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                            Contains at least one special character
                        </li>
                    </ul>
                </div>
            </div>
        </AuthLayout>
    );
}
