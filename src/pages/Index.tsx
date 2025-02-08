import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/Dashboard/BalanceCard";
import { BudgetDistribution } from "@/components/Dashboard/BudgetDistribution";
import { TransactionBox } from "@/components/Dashboard/TransactionBox";
import { TransactionForm } from "@/components/Dashboard/TransactionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  isFixed?: boolean;
  isRecurring?: boolean;
  installments?: {
    total: number;
    current: number;
    paid: number;
  };
  isPaid?: boolean;
  dueDate?: string;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Check for upcoming due payments
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

  const calculateTotals = () => {
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

  const calculateCategoryTotals = (transactions: Transaction[]) => {
    return transactions.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = 0;
      }
      acc[curr.category] += curr.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const handleNewTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: editingTransaction?.id || transactions.length + 1,
      type: data.type,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
      isFixed: data.type === 'expense' ? data.isFixed : undefined,
      isRecurring: data.isRecurring,
      installments: data.installments ? {
        total: parseInt(data.installments),
        current: 1,
        paid: parseInt(data.paidInstallments) || 0,
      } : undefined,
      isPaid: false,
      dueDate: data.dueDate,
    };

    if (editingTransaction) {
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id ? newTransaction : t
      ));
    } else {
      if (data.isFixed || data.isRecurring) {
        const recurringTransactions: Transaction[] = [];
        const months = data.installments ? parseInt(data.installments) : 12;
        const paidInstallments = parseInt(data.paidInstallments) || 0;
        
        for (let i = 0; i < months; i++) {
          const date = new Date(data.date);
          date.setMonth(date.getMonth() + i);
          
          const dueDate = new Date(data.dueDate);
          dueDate.setMonth(dueDate.getMonth() + i);

          const current = i + 1;
          const isPaid = current <= paidInstallments;

          recurringTransactions.push({
            ...newTransaction,
            id: transactions.length + 1 + i,
            date: date.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            isPaid,
            installments: data.installments ? {
              total: months,
              current,
              paid: paidInstallments,
            } : undefined,
          });
        }
        setTransactions([...transactions, ...recurringTransactions]);
      } else {
        setTransactions([...transactions, newTransaction]);
      }
    }

    setEditingTransaction(null);
    setIsDialogOpen(false);
  };

  const handleTogglePayment = (id: number) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, isPaid: !t.isPaid } : t
    ));
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleYearChange = (year: string) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(parseInt(year));
      return newDate;
    });
  };

  const totals = calculateTotals();

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const calculateBudgetDistribution = () => {
    const categoryTotals = calculateCategoryTotals(
      filteredTransactions.filter(t => t.type === 'expense')
    );
    
    const totalExpenses = Object.values(categoryTotals).reduce((acc, curr) => acc + curr, 0);
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: totalExpenses ? (amount / totalExpenses) * 100 : 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }));
  };

  const budgetDistributionData = calculateBudgetDistribution();

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const fixedExpenses = filteredTransactions.filter(t => t.type === 'expense' && t.isFixed);
  const variableExpenses = filteredTransactions.filter(t => t.type === 'expense' && !t.isFixed);

  const incomeCategoryTotals = calculateCategoryTotals(incomeTransactions);
  const fixedExpenseCategoryTotals = calculateCategoryTotals(fixedExpenses);
  const variableExpenseCategoryTotals = calculateCategoryTotals(variableExpenses);

  const calculatePaidUnpaidTotals = (transactions: Transaction[]) => {
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

  const fixedExpensesTotals = calculatePaidUnpaidTotals(fixedExpenses);
  const variableExpensesTotals = calculatePaidUnpaidTotals(variableExpenses);

  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYearNum - 5 + i);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Controle Financeiro
          </h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            Nova Transação
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <Button variant="ghost" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium">
              {MONTHS[currentMonth]}
            </span>
            
            <Select
              value={currentYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BalanceCard
            balance={totals.balance}
            income={totals.income}
            expenses={totals.expenses}
          />
          <BudgetDistribution data={budgetDistributionData} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TransactionBox
            title="Receitas"
            transactions={incomeTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePayment={handleTogglePayment}
            categoryTotals={incomeCategoryTotals}
            total={totals.income}
          />
          <TransactionBox
            title={`Despesas Fixas (Pago: ${formatCurrency(fixedExpensesTotals.paid)} | Não Pago: ${formatCurrency(fixedExpensesTotals.unpaid)})`}
            transactions={fixedExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePayment={handleTogglePayment}
            categoryTotals={fixedExpenseCategoryTotals}
            total={fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0)}
          />
          <TransactionBox
            title={`Despesas Esporádicas (Pago: ${formatCurrency(variableExpensesTotals.paid)} | Não Pago: ${formatCurrency(variableExpensesTotals.unpaid)})`}
            transactions={variableExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePayment={handleTogglePayment}
            categoryTotals={variableExpenseCategoryTotals}
            total={variableExpenses.reduce((acc, curr) => acc + curr.amount, 0)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleNewTransaction}
              initialData={editingTransaction}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
