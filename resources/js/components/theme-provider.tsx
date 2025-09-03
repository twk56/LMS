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
    const { settings, updateSettings } = useAppearance();
    const [theme, setTheme] = useState<ThemeProviderState['theme']>(
        () => settings.theme || defaultTheme
    );

    // Sync theme with appearance settings
    useEffect(() => {
        if (settings.theme && settings.theme !== theme) {
            setTheme(settings.theme);
        }
    }, [settings.theme, theme]);

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

    const value = {
        theme,
        setTheme: (newTheme: ThemeProviderState['theme']) => {
            setTheme(newTheme);
            // Update appearance settings when theme changes
            updateSettings({ theme: newTheme });
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
