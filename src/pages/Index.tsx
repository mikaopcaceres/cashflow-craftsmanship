
import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/Dashboard/BalanceCard";
import { BudgetDistribution } from "@/components/Dashboard/BudgetDistribution";
import { TransactionBox } from "@/components/Dashboard/TransactionBox";
import { TransactionForm } from "@/components/Dashboard/TransactionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Carregar transações do localStorage ao iniciar
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Salvar transações no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

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

  const budgetDistribution = [
    { name: "Essenciais", value: 50, color: "#1E3A8A" },
    { name: "Lazer", value: 20, color: "#059669" },
    { name: "Desejos", value: 10, color: "#F97316" },
    { name: "Investimentos", value: 20, color: "#6366F1" },
  ];

  const handleNewTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: editingTransaction?.id || transactions.length + 1,
      type: data.type,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
      isFixed: data.type === 'expense' ? data.isFixed : undefined,
    };

    if (editingTransaction) {
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id ? newTransaction : t
      ));
    } else {
      setTransactions([...transactions, newTransaction]);
    }

    setEditingTransaction(null);
    setIsDialogOpen(false);
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

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const fixedExpenses = filteredTransactions.filter(t => t.type === 'expense' && t.isFixed);
  const variableExpenses = filteredTransactions.filter(t => t.type === 'expense' && !t.isFixed);

  // Gerar array de anos (5 anos antes e depois do atual)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYearNum - 5 + i);

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
          <BudgetDistribution data={budgetDistribution} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TransactionBox
            title="Receitas"
            transactions={incomeTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <TransactionBox
            title="Despesas Fixas"
            transactions={fixedExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <TransactionBox
            title="Despesas Esporádicas"
            transactions={variableExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
