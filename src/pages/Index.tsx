import { BalanceCard } from "@/components/Dashboard/BalanceCard";
import { BudgetDistribution } from "@/components/Dashboard/BudgetDistribution";
import { TransactionList } from "@/components/Dashboard/TransactionList";

const Index = () => {
  // Mock data - will be replaced with real data later
  const financialData = {
    balance: 5000,
    income: 8000,
    expenses: 3000,
  };

  const budgetDistribution = [
    { name: "Essenciais", value: 50, color: "#1E3A8A" },
    { name: "Lazer", value: 20, color: "#059669" },
    { name: "Desejos", value: 10, color: "#F97316" },
    { name: "Investimentos", value: 20, color: "#6366F1" },
  ];

  const recentTransactions = [
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
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Controle Financeiro
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BalanceCard
            balance={financialData.balance}
            income={financialData.income}
            expenses={financialData.expenses}
          />
          <BudgetDistribution data={budgetDistribution} />
        </div>

        <div className="mt-6">
          <TransactionList transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;