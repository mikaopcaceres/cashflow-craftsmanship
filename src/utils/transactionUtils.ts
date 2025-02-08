
import { Transaction } from '@/types/transaction';

export const calculateTotals = (transactions: Transaction[], currentMonth: number, currentYear: number) => {
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  return {
    income,
    expenses,
    balance: income - expenses,
  };
};

export const calculateCategoryTotals = (transactions: Transaction[]) => {
  return transactions.reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = 0;
    }
    acc[curr.category] += curr.amount;
    return acc;
  }, {} as Record<string, number>);
};

export const calculatePaidUnpaidTotals = (transactions: Transaction[]) => {
  return transactions.reduce(
    (acc, curr) => {
      if (curr.isPaid) {
        acc.paid += curr.amount;
      } else {
        acc.unpaid += curr.amount;
      }
      return acc;
    },
    { paid: 0, unpaid: 0 }
  );
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const calculateBudgetDistribution = (transactions: Transaction[]) => {
  const categoryTotals = calculateCategoryTotals(
    transactions.filter(t => t.type === 'expense')
  );
  
  const totalExpenses = Object.values(categoryTotals).reduce((acc, curr) => acc + curr, 0);
  
  return Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: totalExpenses ? (amount / totalExpenses) * 100 : 0,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  }));
};

