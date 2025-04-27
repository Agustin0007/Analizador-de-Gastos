import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const BUDGET_COLLECTION = 'budgets';
const EXPENSES_COLLECTION = 'expenses';
const ALERT_THRESHOLD = 0.8;

export const budgetService = {
  async createBudget(userId, budgetData) {
    if (!userId || !budgetData) {
      throw new Error('Invalid budget data');
    }

    try {
      const docRef = await addDoc(collection(db, BUDGET_COLLECTION), {
        ...budgetData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...budgetData,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating budget:', error);
      throw new Error('Failed to create budget');
    }
  },

  async getUserBudgets(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const budgetsQuery = query(
        collection(db, BUDGET_COLLECTION),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(budgetsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw new Error('Failed to fetch budgets');
    }
  },

  async checkBudgetLimits(userId, expense) {
    if (!userId || !expense) {
      throw new Error('Invalid parameters');
    }

    try {
      const budgets = await this.getUserBudgets(userId);
      const relevantBudget = budgets.find(b => b.category === expense.category);

      if (!relevantBudget) {
        return null;
      }

      const expensesQuery = query(
        collection(db, EXPENSES_COLLECTION),
        where('userId', '==', userId),
        where('category', '==', expense.category)
      );

      const expensesSnapshot = await getDocs(expensesQuery);
      const totalSpent = expensesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0),
        0
      );

      const isOverLimit = totalSpent >= relevantBudget.limit;
      const isNearLimit = totalSpent >= relevantBudget.limit * ALERT_THRESHOLD;

      return {
        isOverLimit,
        isNearLimit,
        totalSpent,
        limit: relevantBudget.limit,
        remaining: Math.max(0, relevantBudget.limit - totalSpent),
        percentage: (totalSpent / relevantBudget.limit) * 100
      };
    } catch (error) {
      console.error('Error checking budget limits:', error);
      throw new Error('Failed to check budget limits');
    }
  },

  async updateBudget(budgetId, updates) {
    if (!budgetId || !updates) {
      throw new Error('Invalid update parameters');
    }

    try {
      const budgetRef = doc(db, BUDGET_COLLECTION, budgetId);
      await updateDoc(budgetRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw new Error('Failed to update budget');
    }
  }
};