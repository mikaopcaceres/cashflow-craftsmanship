
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

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

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateRemainingAmount = (transaction: Transaction) => {
    if (!transaction.installments) return 0;
    
    const remainingInstallments = transaction.installments.total - transaction.installments.paid;
    return transaction.amount * remainingInstallments;
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Últimas Transações</h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {transaction.type === 'income' ? (
                <ArrowUpCircle className="w-6 h-6 text-secondary" />
              ) : (
                <ArrowDownCircle className="w-6 h-6 text-accent" />
              )}
              <div>
                <p className="font-medium">
                  {transaction.description}
                  {transaction.installments && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({transaction.installments.paid}/{transaction.installments.total})
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${
                transaction.type === 'income' ? 'text-secondary' : 'text-accent'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
              {transaction.installments && (
                <p className="text-sm text-gray-500">
                  Restante: {formatCurrency(calculateRemainingAmount(transaction))}
                </p>
              )}
              <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
