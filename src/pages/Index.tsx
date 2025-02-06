import { useState } from "react";
import { BalanceCard } from "@/components/Dashboard/BalanceCard";
import { BudgetDistribution } from "@/components/Dashboard/BudgetDistribution";
import { TransactionBox } from "@/components/Dashboard/TransactionBox";
import { TransactionForm } from "@/components/Dashboard/TransactionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  isFixed?: boolean;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: "income",
      description: "Salário",
      amount: 5000,
      category: "salary",
      date: "2024-03-15",
    },
    {
      id: 2,
      type: "expense",
      description: "Aluguel",
      amount: 1500,
      category: "housing",
      date: "2024-03-10",
      isFixed: true,
    },
    {
      id: 3,
      type: "expense",
      description: "Supermercado",
      amount: 800,
      category: "food",
      date: "2024-03-08",
      isFixed: false,
    },
  ]);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const calculateTotals = () => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = transactions
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

  const totals = calculateTotals();

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const fixedExpenses = transactions.filter(t => t.type === 'expense' && t.isFixed);
  const variableExpenses = transactions.filter(t => t.type === 'expense' && !t.isFixed);

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