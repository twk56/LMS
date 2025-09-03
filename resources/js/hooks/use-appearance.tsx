import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
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
        
        // Send to server in background (don't block UI)
        router.patch('/settings/appearance', { theme: updatedSettings.theme }, {
            onFinish: () => setIsLoading(false),
            preserveScroll: true,
            preserveState: true,
        });
    };

    const updateAppearance = updateSettings; // Alias for backward compatibility

    const resetSettings = () => {
        const defaultSettings: AppearanceSettings = {
            theme: 'system',
        };
        setSettings(defaultSettings);
        localStorage.removeItem('appearance-settings');
        
        // Send default settings to server
        setIsLoading(true);
        router.patch('/settings/appearance', { theme: defaultSettings.theme }, {
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
