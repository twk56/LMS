// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm();
    const { post: logoutPost, processing: logoutProcessing } = useForm();

    const handleResend = () => {
        post(route('verification.send'));
    };

    const handleLogout = () => {
        logoutPost(route('logout'));
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <div className="space-y-6 text-center">
                    <>
                        <Button onClick={handleResend} disabled={processing} variant="secondary">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Resend verification email
                        </Button>

                        <Button 
                            variant="ghost" 
                            className="mx-auto block text-sm"
                            onClick={handleLogout}
                            disabled={logoutProcessing}
                        >
                            {logoutProcessing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Log out
                        </Button>
                    </>
            </div>
        </AuthLayout>
    );
}
