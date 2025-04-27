import { useConfig } from './ConfigContext';
import emailjs from '@emailjs/browser';

export function ExpenseProvider({ children }) {
  const { config } = useConfig();

  const checkBudgetLimits = async (newExpense) => {
    if (!config.budgets || !config.general.emailNotifications) return;

    const today = new Date();
    const expenseCategory = config.budgets.find(b => b.categoryId === newExpense.categoryId);

    if (!expenseCategory) return;

    // Obtener todos los gastos del período actual
    const periodExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      switch (expenseCategory.period) {
        case 'daily':
          return expDate.toDateString() === today.toDateString();
        case 'weekly':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          return expDate >= weekStart;
        case 'monthly':
          return expDate.getMonth() === today.getMonth() && 
                 expDate.getFullYear() === today.getFullYear();
        case 'yearly':
          return expDate.getFullYear() === today.getFullYear();
        default:
          return false;
      }
    });

    const totalAmount = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0) + newExpense.amount;
    const percentage = (totalAmount / expenseCategory.amount) * 100;

    if (percentage >= expenseCategory.alertThreshold) {
      await sendAlertEmail({
        category: config.categories.find(c => c.id === newExpense.categoryId),
        currentAmount: totalAmount,
        budgetAmount: expenseCategory.amount,
        percentage,
        period: expenseCategory.period
      });
    }
  };

  const sendAlertEmail = async (alertData) => {
    try {
      await emailjs.send(
        'service_t3tk3ug',
        'template_5ql5teb',
        {
          to_email: config.general.email,
          category_name: alertData.category.name,
          current_amount: new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: config.general.currency
          }).format(alertData.currentAmount),
          budget_amount: new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: config.general.currency
          }).format(alertData.budgetAmount),
          percentage: alertData.percentage.toFixed(1),
          period: alertData.period
        },
        'S3gNeo7kvU7LlC_Wl'
      );
    } catch (error) {
      console.error('Error sending alert email:', error);
    }
  };

  const addExpense = async (expense) => {
    // ... código existente de addExpense ...
    await checkBudgetLimits(expense);
  };

  // ... resto del código ...
}