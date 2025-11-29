'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            // Only register in production or if explicitly desired
            // For this project, we'll register it even on localhost to test PWA installability
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        } else if ('serviceWorker' in navigator) {
            // Register on localhost too for testing
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    return null;
}
