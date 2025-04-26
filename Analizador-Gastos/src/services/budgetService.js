import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { createNotification } from './notificationService';

export const budgetService = {
  async createBudget(userId, budgetData) {
    try {
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...budgetData,
        userId,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...budgetData };
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  async getUserBudgets(userId) {
    try {
      const q = query(collection(db, 'budgets'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  },

  async checkBudgetLimits(userId, expense) {
    try {
      const budgets = await this.getUserBudgets(userId);
      const relevantBudget = budgets.find(b => b.category === expense.category);

      if (relevantBudget) {
        const q = query(
          collection(db, 'expenses'),
          where('userId', '==', userId),
          where('category', '==', expense.category)
        );
        const expenses = await getDocs(q);
        const totalSpent = expenses.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

        if (totalSpent >= relevantBudget.limit) {
          await createNotification({
            userId,
            type: 'warning',
            message: `¡Alerta! Has superado el límite de ${relevantBudget.limit} en la categoría ${expense.category}`,
            email: relevantBudget.email
          });
        } else if (totalSpent >= relevantBudget.limit * 0.8) {
          await createNotification({
            userId,
            type: 'info',
            message: `Estás cerca de alcanzar el límite en la categoría ${expense.category}`,
            email: relevantBudget.email
          });
        }
      }
    } catch (error) {
      console.error('Error checking budget limits:', error);
    }
  }
};