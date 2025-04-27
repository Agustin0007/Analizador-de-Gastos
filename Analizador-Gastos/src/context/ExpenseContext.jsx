import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addExpense = useCallback(async (expenseData) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      
      const newExpense = {
        id: docRef.id,
        ...expenseData,
        userId: user.uid
      };
      
      setExpenses(prev => [...prev, newExpense]);
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }, [user]);

  const value = useMemo(() => ({
    expenses,
    loading,
    addExpense,
    fetchExpenses
  }), [expenses, loading, addExpense, fetchExpenses]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}