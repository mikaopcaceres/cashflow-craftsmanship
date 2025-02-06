import { useState } from "react";
import { BalanceCard } from "@/components/Dashboard/BalanceCard";
import { BudgetDistribution } from "@/components/Dashboard/BudgetDistribution";
import { TransactionList } from "@/components/Dashboard/TransactionList";
import { TransactionForm } from "@/components/Dashboard/TransactionForm";

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: "income",
      description: "Salário",
      amount: 5000,
      category: "Receita Fixa",
      date: "2024-03-15",
    },
    {
      id: 2,
      type: "expense",
      description: "Aluguel",
      amount: 1500,
      category: "Moradia",
      date: "2024-03-10",
    },
    {
      id: 3,
      type: "expense",
      description: "Supermercado",
      amount: 800,
      category: "Alimentação",
      date: "2024-03-08",
    },
  ]);

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
      id: transactions.length + 1,
      type: data.type,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
    };
    setTransactions([...transactions, newTransaction]);
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Controle Financeiro
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BalanceCard
            balance={totals.balance}
            income={totals.income}
            expenses={totals.expenses}
          />
          <BudgetDistribution data={budgetDistribution} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Nova Transação</h2>
            <TransactionForm onSubmit={handleNewTransaction} />
          </div>
          <div>
            <TransactionList transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;