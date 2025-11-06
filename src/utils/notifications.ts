/**
 * Push notification utilities for MediMinder
 */

import api from "../lib/api";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const getSubscription = async (): Promise<PushSubscription | null> => {
  const registration = await navigator.serviceWorker.ready;
  
  try {
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const nav = navigator as any;
  
  const isBrave = nav.brave?.isBrave || /Brave/.test(ua);
  const isChromium = /Chromium/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edge|Opera|Chromium|Brave/.test(ua);
  
  const browser = {
    name: 'unknown',
    version: 'unknown',
    isChrome: isChrome,
    isFirefox: /Firefox/.test(ua),
    isBrave: isBrave,
    isUngoogledChromium: isChromium && !isChrome && !isBrave,
  };
  
  if (browser.isFirefox) browser.name = 'Firefox';
  else if (browser.isBrave) browser.name = 'Brave';
  else if (browser.isUngoogledChromium) browser.name = 'Ungoogled Chromium';
  else if (browser.isChrome) browser.name = 'Chrome';
  
  return browser;
};

export const subscribeToPush = async (): Promise<PushSubscription | null> => {
  const browser = getBrowserInfo();
  console.log('Browser detected:', browser.name);
  
  if (browser.isBrave || browser.isUngoogledChromium) {
    const browserName = browser.isBrave ? 'Brave' : 'Ungoogled Chromium';
    console.warn(`⚠️ ${browserName} detected - Push API may have issues`);
    
    const proceed = confirm(
      `${browserName} może mieć problemy z Push API. Subskrypcja może się zawiesić.\n\n` +
      `Zalecamy użycie Chrome lub Firefox dla pełnej kompatybilności.\n\n` +
      `Czy chcesz kontynuować?`
    );
    
    if (!proceed) {
      console.log('User cancelled subscription for incompatible browser');
      return null;
    }
  }
  
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Worker not supported in this browser');
    alert('Ta przeglądarka nie obsługuje Service Workers. Push notifications wymagają Service Workers.');
    return null;
  }
  
  if (!('PushManager' in window)) {
    console.error('❌ Push API not supported in this browser');
    alert('Ta przeglądarka nie obsługuje Web Push API.');
    return null;
  }
  
  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    console.warn('❌ Notification permission denied');
    alert('Uprawnienia do powiadomień zostały odrzucone. Włącz je w ustawieniach przeglądarki.');
    return null;
  }

  console.log('✅ Notification permission granted');

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker ready:', registration.scope);
    
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    console.log('VAPID key configured:', !!vapidPublicKey, 'Length:', vapidPublicKey?.length || 0);

    let subscription = await registration.pushManager.getSubscription();
    console.log('Existing subscription:', !!subscription);
    
    if (!subscription) {
      const subscribeOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
      };

      if (vapidPublicKey && vapidPublicKey.trim() !== '') {
        try {
          console.log('Converting VAPID key...');
          const keyArray = urlBase64ToUint8Array(vapidPublicKey);
          console.log('Key converted, length:', keyArray.byteLength, 'bytes');
          
          subscribeOptions.applicationServerKey = keyArray;
          
          console.log('Attempting to subscribe...');
          const startTime = Date.now();
          
          const timeoutMs = (browser.isBrave || browser.isUngoogledChromium) ? 15000 : 10000;
          console.log(`Using timeout: ${timeoutMs}ms for ${browser.name}`);
          
          subscription = await Promise.race([
            registration.pushManager.subscribe(subscribeOptions),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error(`Subscription timeout after ${timeoutMs/1000} seconds`)), timeoutMs)
            )
          ]) as PushSubscription;
          
          const elapsed = Date.now() - startTime;
          console.log(`✅ Subscription created in ${elapsed}ms`);
          console.log('Subscription endpoint:', subscription.endpoint.substring(0, 50) + '...');
          
          try {
            const subJson = subscription.toJSON();
            console.log('Saving subscription to backend...');
            
            await api.post('/api/push-subscriptions/', {
              subscription: subJson
            });
            
            console.log('✅ Subscription saved to backend');
          } catch (err: any) {
            console.error('❌ Failed to save subscription to backend:', err);
            console.error('Error details:', err.response?.data || err.message);
            // Don't return null - subscription was created, just not saved
          }
        } catch (error: any) {
          console.error('❌ Subscription error:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          
          if (error.name === 'InvalidAccessError') {
            const msg = 'VAPID key is invalid or incorrectly formatted. Please check your VAPID_PUBLIC_KEY.';
            console.error('❌', msg);
            alert(msg);
          } else if (error.message?.includes('timeout')) {
            const browserName = browser.name;
            const msg = browser.isBrave || browser.isUngoogledChromium
              ? `${browserName} ma znane problemy z Push API. Subskrypcja nie może zostać utworzona.\n\nZalecamy użycie Chrome lub Firefox dla powiadomień push.`
              : 'Subskrypcja przekroczyła limit czasu. To może wskazywać na problem z implementacją Push API w przeglądarce.\n\nSpróbuj ponownie lub użyj Chrome/Firefox.';
            console.error('❌', msg);
            alert(msg);
            
            if (browser.isBrave) {
              console.info('💡 Brave: Sprawdź ustawienia prywatności -> Shields -> może blokować Push API');
            } else if (browser.isUngoogledChromium) {
              console.info('💡 Ungoogled Chromium: Może wymagać dodatkowych flag lub nie obsługiwać Push API w pełni');
            }
          } else {
            const msg = `Subscription failed: ${error.message || error.name}`;
            console.error('❌', msg);
            alert(msg + '\n\nSzczegóły w konsoli deweloperskiej (F12).');
          }
          return null;
        }
      } else {
        const msg = 'VAPID public key not configured. Push subscriptions require VAPID keys.';
        console.warn('❌', msg);
        alert(msg);
        return null;
      }
    } else {
      console.log('✅ Using existing subscription');
    }

    return subscription;
  } catch (error: any) {
    console.error('❌ Error in subscribeToPush:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    alert(`Błąd subskrypcji: ${error.message || error.name}\n\nSzczegóły w konsoli (F12).`);
    return null;
  }
};

export const sendTestNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    });
  }
};

export const triggerTestPush = async (): Promise<boolean> => {
  try {
    await api.post('/api/send-test-push/');
    return true;
  } catch (e) {
    console.error('Failed to trigger test push:', e);
    return false;
  }
};

export const unsubscribeAndPurge = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
    }
    await api.delete('/api/push-subscriptions/purge/');
    return true;
  } catch (e) {
    console.error('Failed to unsubscribe/purge:', e);
    return false;
  }
};

