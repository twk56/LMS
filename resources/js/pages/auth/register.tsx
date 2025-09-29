import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, User, Mail, Lock, Eye, EyeOff, Shield, Sparkles, Layers, ArrowRight, Brain, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RegisterProps {
    status?: string;
}

export default function Register({ status }: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    // Mouse tracking for interactive effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if passwords match before submitting
        if (data.password !== data.password_confirmation) {
            console.error('Passwords do not match');
            return;
        }
        
        post('/register', {
            onSuccess: () => {
                reset('password', 'password_confirmation');
                console.log('Registration successful!');
            },
            onError: (errors) => {
                console.error('Registration failed:', errors);
            }
        });
    };

    return (
        <>
            <Head title="สร้างบัญชี - Laravel Learning Management System" />
            
            {/* Creative Register Page */}
            <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
                    }}></div>
                    
                    {/* Floating Geometric Shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={`absolute w-${4 + (i % 3) * 2} h-${4 + (i % 3) * 2} opacity-10`}
                                style={{
                                    left: `${10 + (i * 12) % 80}%`,
                                    top: `${10 + (i * 15) % 80}%`,
                                    animationDelay: `${i * 0.5}s`
                                }}
                            >
                                <div className={`w-full h-full ${
                                    i % 4 === 0 ? 'bg-purple-500 rounded-full' :
                                    i % 4 === 1 ? 'bg-blue-500 rotate-45' :
                                    i % 4 === 2 ? 'bg-pink-500 rounded-lg' :
                                    'bg-yellow-500'
                                } animate-pulse`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Register Form Container */}
                <div className="relative z-10 w-full max-w-md mx-auto p-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center space-x-3 mb-6">
                            <div className="relative group">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                                    <UserPlus className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl opacity-30 blur group-hover:opacity-60 transition-opacity duration-300"></div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">
                            Join
                            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                                Laravel Learning Management System
                            </span>
                        </h1>
                        <p className="text-gray-300">สร้างบัญชีใหม่เพื่อเริ่มต้นการเรียนรู้อันน่าตื่นเต้น</p>
                    </div>

                    {/* Form Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                        <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Status Message */}
                                {status && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                                        <div className="flex items-center">
                                            <Shield className="h-5 w-5 text-green-400 mr-2" />
                                            <span className="text-sm font-medium text-green-300">{status}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-white">
                                        ชื่อ-นามสกุล
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            placeholder="กรอกชื่อ-นามสกุลของคุณ"
                                            className="w-full pl-12 pr-4 py-4 text-base bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:bg-white/20 focus:outline-none"
                                        />
                                    </div>
                                    <InputError message={errors.name} className="mt-1 text-red-400" />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-white">
                                        อีเมล
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            placeholder="กรอกอีเมลของคุณ"
                                            className="w-full pl-12 pr-4 py-4 text-base bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:bg-white/20 focus:outline-none"
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1 text-red-400" />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-white">
                                        รหัสผ่าน
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            tabIndex={3}
                                            autoComplete="new-password"
                                            placeholder="กรอกรหัสผ่าน"
                                            className="w-full pl-12 pr-12 py-4 text-base bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:bg-white/20 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1 text-red-400" />
                                </div>

                                {/* Password Confirmation Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-white">
                                        ยืนยันรหัสผ่าน
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            placeholder="ยืนยันรหัสผ่าน"
                                            className="w-full pl-12 pr-12 py-4 text-base bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:bg-white/20 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1 text-red-400" />
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-center space-x-3">
                                    <Checkbox 
                                        id="terms" 
                                        checked={data.terms}
                                        onCheckedChange={(checked) => setData('terms', checked as boolean)}
                                        tabIndex={5}
                                        className="border-2 border-white/30 data-[state=checked]:border-purple-400 data-[state=checked]:bg-purple-500"
                                    />
                                    <Label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                                        ฉันยอมรับ{' '}
                                        <TextLink href="/terms" className="text-purple-400 hover:text-purple-300">
                                            ข้อกำหนดและเงื่อนไข
                                        </TextLink>
                                        {' '}และ{' '}
                                        <TextLink href="/privacy" className="text-purple-400 hover:text-purple-300">
                                            นโยบายความเป็นส่วนตัว
                                        </TextLink>
                                    </Label>
                                </div>
                                <InputError message={errors.terms} className="mt-1 text-red-400" />

                                {/* Submit Button */}
                                <Button 
                                    type="submit" 
                                    className="w-full py-4 px-6 text-base font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-2xl hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group" 
                                    tabIndex={6} 
                                    disabled={processing || !data.terms}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center space-x-2 relative z-10">
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                            <span>กำลังสร้างบัญชี...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2 relative z-10">
                                            <UserPlus className="h-5 w-5" />
                                            <span>สร้างบัญชีใหม่</span>
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                                </Button>
                            </form>

                            {/* Sign In Link */}
                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-300">
                                    มีบัญชีอยู่แล้ว?{' '}
                                    <TextLink 
                                        href="/login" 
                                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors" 
                                        tabIndex={7}
                                    >
                                        เข้าสู่ระบบ
                                    </TextLink>
                                </p>
                            </div>

                            {/* Security Notice */}
                            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="flex items-start space-x-3">
                                    <Shield className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-gray-400">
                                        <p className="font-medium mb-1 text-gray-300">ความปลอดภัย</p>
                                        <p>ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย เราไม่เก็บรหัสผ่านในรูปแบบข้อความ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <TextLink 
                            href="/" 
                            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                            <span>กลับสู่หน้าหลัก</span>
                        </TextLink>
                    </div>
                </div>
            </div>
        </>
    );
}
