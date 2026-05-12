import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: any;
  }
}

export const useTelegram = () => {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand();
      setTg(telegram);
      setUser(telegram.initDataUnsafe?.user);
    }
  }, []);

  const close = () => tg?.close();
  const sendData = (data: any) => tg?.sendData(JSON.stringify(data));
  const showAlert = (message: string) => tg?.showAlert(message);
  const hapticImpact = (style: 'light' | 'medium' | 'heavy') => tg?.HapticFeedback.impactOccurred(style);
  const hapticNotification = (type: 'error' | 'success' | 'warning') => tg?.HapticFeedback.notificationOccurred(type);

  return { tg, user, close, sendData, showAlert, hapticImpact, hapticNotification };
};