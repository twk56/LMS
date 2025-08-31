import React, { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    errorMessage?: string;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            errorMessage: error.message,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="mx-auto max-w-md text-center">
                        <div className="mb-4 text-6xl">😵</div>
                        <h1 className="mb-2 text-2xl font-bold text-foreground">
                            Oops! Something went wrong
                        </h1>
                        <p className="mb-4 text-muted-foreground">
                            {this.state.errorMessage || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, errorMessage: undefined });
                                window.location.reload();
                            }}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
