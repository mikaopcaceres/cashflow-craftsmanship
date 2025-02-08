
import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const upcomingPayments = transactions.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return !t.isPaid && dueDate <= threeDaysFromNow && dueDate >= today;
    });

    upcomingPayments.forEach(payment => {
      toast({
        title: "Pagamento Próximo",
        description: `${payment.description} vence em ${new Date(payment.dueDate!).toLocaleDateString('pt-BR')}`,
      });
    });
  }, [transactions, toast]);

  return {
    transactions,
    setTransactions,
  };
};

