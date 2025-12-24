import { ExpenseRecord, AdvanceRecord, MonthlySummary, CategorySummary, HRPayment } from '@/data/expenseData';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getMonthFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
};

export const calculateTotalExpenses = (expenses: ExpenseRecord[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateTotalAdvances = (advances: AdvanceRecord[], includeReturnable: boolean = true): number => {
  const filtered = includeReturnable ? advances : advances.filter(a => a.type === 'regular');
  return filtered.reduce((sum, advance) => sum + advance.amount, 0);
};

export const calculateReturnableAdvances = (advances: AdvanceRecord[]): number => {
  return advances.filter(a => a.type === 'returnable').reduce((sum, a) => sum + a.amount, 0);
};

export const calculateCategorySummary = (expenses: ExpenseRecord[]): CategorySummary[] => {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  const total = calculateTotalExpenses(expenses);

  expenses.forEach(expense => {
    const current = categoryMap.get(expense.category) || { amount: 0, count: 0 };
    categoryMap.set(expense.category, {
      amount: current.amount + expense.amount,
      count: current.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const calculateMonthlySummary = (
  expenses: ExpenseRecord[],
  advances: AdvanceRecord[],
  hrPayments: HRPayment[] = []
): MonthlySummary[] => {
  const monthlyExpenses = new Map<string, number>();
  const monthlyAdvances = new Map<string, number>();
  const monthlyHRPayments = new Map<string, number>();

  expenses.forEach(expense => {
    const month = getMonthFromDate(expense.date);
    monthlyExpenses.set(month, (monthlyExpenses.get(month) || 0) + expense.amount);
  });

  // Include ALL advances (both regular and returnable) for balance
  advances.forEach(advance => {
    const month = getMonthFromDate(advance.date);
    monthlyAdvances.set(month, (monthlyAdvances.get(month) || 0) + advance.amount);
  });

  hrPayments.forEach(payment => {
    monthlyHRPayments.set(payment.month, (monthlyHRPayments.get(payment.month) || 0) + payment.amount);
  });

  const allMonths = new Set([...monthlyExpenses.keys(), ...monthlyAdvances.keys()]);
  
  let carryForward = 0;
  
  return Array.from(allMonths)
    .sort((a, b) => {
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    })
    .map(month => {
      const totalExpenses = monthlyExpenses.get(month) || 0;
      const monthAdvances = monthlyAdvances.get(month) || 0;
      const totalAdvances = monthAdvances + carryForward;
      const hrPaid = monthlyHRPayments.get(month) || 0;
      const balance = totalAdvances - totalExpenses + hrPaid;
      
      let status: 'ADVANCE LEFT' | 'EXPENSE EXCEEDED' | 'BALANCED' | 'CLEARED BY HR';
      let newCarryForward = 0;
      
      if (hrPaid > 0 && Math.abs(balance) < 100) {
        status = 'CLEARED BY HR';
        newCarryForward = 0;
      } else if (balance > 0) {
        status = 'ADVANCE LEFT';
        newCarryForward = balance;
      } else if (balance < 0) {
        status = 'EXPENSE EXCEEDED';
        newCarryForward = balance; // Carry forward negative balance
      } else {
        status = 'BALANCED';
        newCarryForward = 0;
      }

      const result = {
        month,
        totalExpenses,
        totalAdvances,
        balance: Math.abs(balance),
        hrPaid,
        carryForward: newCarryForward,
        status,
      };
      
      carryForward = newCarryForward;
      return result;
    });
};

export const filterExpensesByMonth = (expenses: ExpenseRecord[], month: string): ExpenseRecord[] => {
  if (month === 'all') return expenses;
  return expenses.filter(expense => getMonthFromDate(expense.date) === month);
};

export const filterExpensesByCategory = (expenses: ExpenseRecord[], category: string): ExpenseRecord[] => {
  if (category === 'all') return expenses;
  return expenses.filter(expense => expense.category.toLowerCase() === category.toLowerCase());
};

export const filterAdvancesByMonth = (advances: AdvanceRecord[], month: string): AdvanceRecord[] => {
  if (month === 'all') return advances;
  return advances.filter(advance => getMonthFromDate(advance.date) === month);
};
