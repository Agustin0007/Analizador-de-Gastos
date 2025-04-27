import { configureStore } from '@reduxjs/toolkit';
import { expensesReducer } from './slices/expensesSlice';
import { authReducer } from './slices/authSlice';
import { budgetReducer } from './slices/budgetSlice';

const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    auth: authReducer,
    budget: budgetReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
        ignoredPaths: ['auth.user']
      },
      thunk: true
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;