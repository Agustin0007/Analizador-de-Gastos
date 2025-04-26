import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { sendEmail } from '../config/emailjs';

export const checkBudgetLimits = async (userId, amount, category) => {
  const budgetsRef = collection(db, 'budgets');
  const q = query(budgetsRef, where('userId', '==', userId), where('category', '==', category));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(async (doc) => {
    const budget = doc.data();
    if (amount >= budget.limit) {
      await createNotification({
        userId,
        type: 'warning',
        message: `Has superado el límite de ${budget.limit} en la categoría ${category}`,
        email: budget.email
      });
    }
  });
};

export const createNotification = async ({ userId, type, message, email }) => {
  try {
    const notification = {
      userId,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    await addDoc(collection(db, 'notifications'), notification);

    if (email) {
      await sendEmail({
        to_email: email,
        subject: 'Alerta de Gastos',
        message: message
      });
    }

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};