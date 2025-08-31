import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: auth.user?.name || '',
        email: auth.user?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/profile', {
            preserveScroll: true,
            onError: (errors) => {
                console.error('Profile update failed:', errors);
            },
            onSuccess: () => {
                console.log('Profile updated successfully');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                        aria-describedby={errors.name ? "name-error" : undefined}
                                    />

                                    <InputError 
                                        id="name-error"
                                        className="mt-2" 
                                        message={errors.name} 
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                    />

                                    <InputError 
                                        id="email-error"
                                        className="mt-2" 
                                        message={errors.email} 
                                    />
                                </div>

                                {mustVerifyEmail && auth.user?.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <button
                                                type="button"
                                                disabled={isVerifyingEmail}
                                                onClick={() => {
                                                    setIsVerifyingEmail(true);
                                                    router.post('/email/verification-notification', {}, {
                                                        onError: (errors) => {
                                                            console.error('Email verification request failed:', errors);
                                                            setIsVerifyingEmail(false);
                                                        },
                                                        onSuccess: () => {
                                                            console.log('Email verification request sent');
                                                            setIsVerifyingEmail(false);
                                                        }
                                                    });
                                                }}
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isVerifyingEmail ? 'Sending...' : 'Click here to resend the verification email.'}
                                            </button>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button 
                                        type="submit"
                                        disabled={processing}
                                        className="min-w-[100px]"
                                    >
                                        {processing ? 'Saving...' : 'Save'}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600 dark:text-green-400">Saved successfully!</p>
                                    </Transition>
                                </div>
                            </>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
