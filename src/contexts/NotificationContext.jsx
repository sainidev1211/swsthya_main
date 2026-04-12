import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../api/config';

const NotificationContext = createContext();
const API_URL = API_BASE_URL;
const SOCKET_URL_CONFIG = SOCKET_URL;

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Computed: unread count (pending/snoozed and not read)
  const unreadCount = notifications.filter(n => !n.isRead && n.status !== 'done').length;

  const fetchNotifications = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API_URL}/notifications/user/${userId}`);
      if (!res.ok) throw new Error(`Fetch notifications failed: ${res.status}`);
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON from server");
      }

      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  const connectSocket = useCallback((userId) => {
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(SOCKET_URL_CONFIG, {
      query: { userId },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔔 Notification socket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('new_notification', (notif) => {
      setNotifications(prev => {
        // Avoid duplicates
        if (prev.find(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });

      // Play notification sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
      } catch (_) {}
    });

    socketRef.current = socket;
  }, []);

  const init = useCallback((userId) => {
    if (!userId) return;
    fetchNotifications(userId);
    connectSocket(userId);
  }, [fetchNotifications, connectSocket]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setNotifications([]);
    setConnected(false);
  }, []);

  // Actions
  const markDone = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/done`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'done', isRead: true } : n));
    } catch (err) {
      console.error('markDone error:', err);
    }
  };

  const snooze = async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/snooze`, { method: 'PATCH' });
      if (!res.ok) throw new Error(`Snooze failed: ${res.status}`);
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON from server");
      }

      if (data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? data.data : n));
      }
    } catch (err) {
      console.error('snooze error:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('markRead error:', err);
    }
  };

  const markAllRead = () => {
    notifications
      .filter(n => !n.isRead)
      .forEach(n => markRead(n._id));
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, connected, init, disconnect, markDone, snooze, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
