
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "./CategoryIcon";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  };
  isPaid?: boolean;
  dueDate?: string;
}

interface TransactionBoxProps {
  title: string;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
  onTogglePayment: (id: number) => void;
  categoryTotals: Record<string, number>;
  total: number;
}

export const TransactionBox = ({ 
  title, 
  transactions, 
  onEdit, 
  onDelete,
  onTogglePayment,
  categoryTotals,
  total
}: TransactionBoxProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDelete = (id: number) => {
    onDelete(id);
    toast({
      title: "Transação removida",
      description: "A transação foi removida com sucesso.",
    });
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-lg font-semibold">{formatCurrency(total)}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total por Categoria</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <CategoryIcon category={category} className="w-4 h-4 text-primary" />
                <span className="text-sm">{category}</span>
              </div>
              <span className="text-sm font-medium">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CategoryIcon category={transaction.category} className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">
                  {transaction.description}
                  {transaction.installments && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({transaction.installments.current}/{transaction.installments.total})
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
                {transaction.dueDate && (
                  <p className="text-sm text-gray-500">
                    Vencimento: {formatDate(transaction.dueDate)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'income' ? 'text-secondary' : 'text-accent'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
              </div>
              <div className="flex space-x-2">
                {transaction.type === 'expense' && (
                  <Button
                    variant={transaction.isPaid ? "default" : "destructive"}
                    size="sm"
                    onClick={() => onTogglePayment(transaction.id)}
                    className="flex items-center gap-1"
                  >
                    {transaction.isPaid ? (
                      <>
                        <Check className="h-4 w-4" />
                        Pago
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        Não Pago
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(transaction)}
                  className="hover:bg-gray-200"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                  className="hover:bg-gray-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-center text-gray-500">Nenhuma transação encontrada</p>
        )}
      </div>
    </Card>
  );
};
