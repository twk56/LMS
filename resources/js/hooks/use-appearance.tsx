import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
    sidebar: 'expanded' | 'collapsed';
    navigation: 'sidebar' | 'top';
    density: 'comfortable' | 'compact';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
}

export interface UseAppearanceReturn {
    settings: AppearanceSettings;
    appearance: AppearanceSettings;
    updateSettings: (newSettings: Partial<AppearanceSettings>) => void;
    updateAppearance: (newSettings: Partial<AppearanceSettings>) => void;
    resetSettings: () => void;
    isLoading: boolean;
}

export function useAppearance(): UseAppearanceReturn {
    const [settings, setSettings] = useState<AppearanceSettings>({
        theme: 'system',
        sidebar: 'expanded',
        navigation: 'sidebar',
        density: 'comfortable',
        colorScheme: 'blue',
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load settings from localStorage or server
        const savedSettings = localStorage.getItem('appearance-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.warn('Failed to parse appearance settings:', error);
            }
        }
    }, []);

    const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        localStorage.setItem('appearance-settings', JSON.stringify(updatedSettings));
        
        // Send to server if needed
        setIsLoading(true);
        router.post('/settings/appearance', updatedSettings, {
            onFinish: () => setIsLoading(false),
        });
    };

    const updateAppearance = updateSettings; // Alias for backward compatibility

    const resetSettings = () => {
        const defaultSettings: AppearanceSettings = {
            theme: 'system',
            sidebar: 'expanded',
            navigation: 'sidebar',
            density: 'comfortable',
            colorScheme: 'blue',
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium',
        };
        setSettings(defaultSettings);
        localStorage.removeItem('appearance-settings');
        
        setIsLoading(true);
        router.post('/settings/appearance/reset', {}, {
            onFinish: () => setIsLoading(false),
        });
    };

    return {
        settings,
        appearance: settings, // Alias for backward compatibility
        updateSettings,
        updateAppearance,
        resetSettings,
        isLoading,
    };
}
