import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

export const BalanceCard = ({ balance, income, expenses }: BalanceCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Saldo Total</h2>
          <p className="text-3xl font-bold text-primary">{formatCurrency(balance)}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <ArrowUpCircle className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-sm text-gray-500">Receitas</p>
              <p className="font-medium text-secondary">{formatCurrency(income)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ArrowDownCircle className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm text-gray-500">Despesas</p>
              <p className="font-medium text-accent">{formatCurrency(expenses)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};