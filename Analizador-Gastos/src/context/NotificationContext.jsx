import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { sendEmail } from '../config/emailjs';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [user]);

  const addNotification = async (notification) => {
    try {
      const notificationData = {
        ...notification,
        userId: user.uid,
        timestamp: new Date().toISOString(),
        read: false
      };

      await addDoc(collection(db, 'notifications'), notificationData);

      if (notification.email) {
        await sendEmail({
          to_email: notification.email,
          message: notification.message,
          subject: notification.subject || 'Alerta de Gastos'
        });
      }

      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const promises = notifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}