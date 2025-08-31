import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onSuccess: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password" 
                                autoComplete="current-password" 
                                autoFocus 
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Confirm password
                            </Button>
                        </div>
                    </div>
            </form>
        </AuthLayout>
    );
}
