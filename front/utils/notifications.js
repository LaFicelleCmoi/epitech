export function sendNotification(title, body) {
  // Electron environment
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    window.electronAPI.showNotification(title, body);
    return;
  }

  // Browser environment - use Web Notifications API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
}

export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}
