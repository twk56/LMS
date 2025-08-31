import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WelcomeProps {
  canLogin: boolean;
  canRegister: boolean;
  laravelVersion: string;
  phpVersion: string;
  auth: {
    user: any;
  };
}

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion, auth }: WelcomeProps) {
  return (
    <>
      <Head title="Welcome" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to <span className="text-blue-600 dark:text-blue-400">Laravel LMS</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A modern Learning Management System built with Laravel, React, and TypeScript
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📚 Course Management
                </CardTitle>
                <CardDescription>
                  Create, organize, and manage courses with ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comprehensive course management system with categories, lessons, and file uploads.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Progress Tracking
                </CardTitle>
                <CardDescription>
                  Monitor student progress and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track learning progress with detailed analytics and performance insights.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏆 Certificates
                </CardTitle>
                <CardDescription>
                  Generate and manage completion certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically generate certificates upon course completion.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Analytics
                </CardTitle>
                <CardDescription>
                  Advanced analytics and reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comprehensive analytics dashboard with insights and reports.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔔 Notifications
                </CardTitle>
                <CardDescription>
                  Real-time notifications system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stay updated with real-time notifications and alerts.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Modern UI
                </CardTitle>
                <CardDescription>
                  Beautiful and responsive design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modern, responsive design with dark mode support.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {canLogin && (
                <Button asChild size="lg">
                  <a href="/login" className="text-lg px-8 py-3">
                    Login
                  </a>
                </Button>
              )}
              
              {canRegister && (
                <Button asChild variant="outline" size="lg">
                  <a href="/register" className="text-lg px-8 py-3">
                    Register
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
              Built with Modern Technologies
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                Laravel {laravelVersion}
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                PHP {phpVersion}
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                React 19
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                TypeScript
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                Tailwind CSS
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                Inertia.js
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
