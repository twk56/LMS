import { createContext, useContext, useEffect, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: 'light' | 'dark' | 'system';
    storageKey?: string;
}

interface ThemeProviderState {
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
    ...props
}: ThemeProviderProps) {
    const { settings } = useAppearance();
    const [theme, setTheme] = useState<ThemeProviderState['theme']>(
        () => (localStorage.getItem(storageKey) as ThemeProviderState['theme']) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Apply appearance settings
        if (settings.reducedMotion) {
            root.style.setProperty('--motion-reduce', '1');
        } else {
            root.style.removeProperty('--motion-reduce');
        }

        if (settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        root.setAttribute('data-font-size', settings.fontSize);
        root.setAttribute('data-color-scheme', settings.colorScheme);
        root.setAttribute('data-density', settings.density);
        root.setAttribute('data-navigation', settings.navigation);
        root.setAttribute('data-sidebar', settings.sidebar);
    }, [settings]);

    const value = {
        theme,
        setTheme: (theme: ThemeProviderState['theme']) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
