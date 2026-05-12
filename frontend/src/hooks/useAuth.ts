import { useEffect, useState } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const initData = window.Telegram?.WebApp?.initData || '';
        
        // Для локального тестирования без Telegram
        if (!initData && import.meta.env.DEV) {
          console.warn('No Telegram initData, using mock user');
          const mockUser = { id: 1, firstName: 'Test', role: 'admin' };
          localStorage.setItem('token', 'mock-token');
          setUser(mockUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        const response = await axios.post('/api/auth/telegram', { initData });
        const { user: authUser, token } = response.data;
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(authUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return { isAuthenticated, user, loading };
};