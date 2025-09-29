import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set CSRF token for axios
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Laravel Echo Configuration
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    // Only initialize Echo if we have valid Pusher configuration
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
    
    if (pusherKey && pusherKey !== 'your-pusher-key' && pusherCluster) {
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: pusherKey,
            cluster: pusherCluster,
            forceTLS: true,
            encrypted: true,
        });
    } else {
        // Disable Echo for local development without Pusher
        window.Echo = {
            channel: () => ({
                listen: () => {},
                stopListening: () => {},
            }),
            private: () => ({
                listen: () => {},
                stopListening: () => {},
            }),
            join: () => ({
                listen: () => {},
                stopListening: () => {},
            }),
            leave: () => {},
            disconnect: () => {},
        };
        console.log('Echo disabled: No valid Pusher configuration found');
    }
}
