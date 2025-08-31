import { type ReactNode } from 'react';

interface AppContentProps {
    children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
    return (
        <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
        </main>
    );
}
