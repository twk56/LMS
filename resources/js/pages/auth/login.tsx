import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onSuccess: () => reset('password'),
            onError: (errors) => {
                console.error('Login failed:', errors);
            }
        });
    };

    return (
        <AuthLayout title="Welcome Back" description="Sign in to your account to continue your learning journey">
            <Head title="Sign In - LMS" />

            <div className="w-full max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status Message */}
                    {status && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">{status}</span>
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email Address
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="Enter your email address"
                                className="w-full pl-10 pr-4 py-3 text-base border-2 border-border rounded-lg bg-background transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink 
                                    href="/forgot-password" 
                                    className="text-sm text-primary hover:text-primary/80 transition-colors" 
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-12 py-3 text-base border-2 border-border rounded-lg bg-background transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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

                    {/* Remember Me */}
                    <div className="flex items-center space-x-3">
                        <Checkbox 
                            id="remember" 
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                            className="border-2 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                            Remember me for 30 days
                        </Label>
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className="w-full py-3 px-6 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center space-x-2">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <Sparkles className="h-5 w-5" />
                                <span>Sign In</span>
                            </div>
                        )}
                    </Button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <TextLink 
                            href="/register" 
                            className="text-primary hover:text-primary/80 font-medium transition-colors" 
                            tabIndex={5}
                        >
                            Create one now
                        </TextLink>
                    </p>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-1">Secure Login</p>
                            <p>Your credentials are encrypted and secure. We never store your password in plain text.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
