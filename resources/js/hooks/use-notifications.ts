import { useState, useCallback, useRef } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    duration?: number;
}

const MAX_NOTIFICATIONS = 10; // จำกัดจำนวน notifications

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const idCounter = useRef(0);

    const generateId = useCallback(() => {
        idCounter.current += 1;
        return `notification-${Date.now()}-${idCounter.current}`;
    }, []);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = generateId();
        const newNotification = { ...notification, id };
        
        setNotifications(prev => {
            const updated = [...prev, newNotification];
            // จำกัดจำนวน notifications
            if (updated.length > MAX_NOTIFICATIONS) {
                return updated.slice(-MAX_NOTIFICATIONS);
            }
            return updated;
        });
        
        return id;
    }, [generateId]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const showSuccess = useCallback((title: string, message: string, duration = 5000) => {
        return addNotification({ title, message, type: 'success', duration });
    }, [addNotification]);

    const showWarning = useCallback((title: string, message: string, duration = 5000) => {
        return addNotification({ title, message, type: 'warning', duration });
    }, [addNotification]);

    const showError = useCallback((title: string, message: string, duration = 7000) => {
        return addNotification({ title, message, type: 'error', duration });
    }, [addNotification]);

    const showInfo = useCallback((title: string, message: string, duration = 5000) => {
        return addNotification({ title, message, type: 'info', duration });
    }, [addNotification]);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showWarning,
        showError,
        showInfo,
    };
}
