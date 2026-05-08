import { useEffect, useState } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    // Request notification permission on first use
    if (permission === 'default') {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
      });
    }
  }, [permission]);

  // Register service worker for push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(() => {
        setSubscriptionActive(true);
      }).catch(err => console.error('Service worker registration failed:', err));
    }
  }, []);

  const sendNotification = async (title, options = {}) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      // Try to use service worker for background notifications
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg.showNotification) {
          await reg.showNotification(title, {
            icon: '/icon.png',
            badge: '/badge.png',
            requireInteraction: true,
            ...options
          });
        }
      } else {
        // Fallback to standard Notification API
        new Notification(title, {
          requireInteraction: true,
          ...options
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return { 
    permission, 
    subscriptionActive, 
    sendNotification,
    requestPermission: () => Notification.requestPermission()
  };
}