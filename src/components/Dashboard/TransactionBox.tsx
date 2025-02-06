import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "./CategoryIcon";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  isFixed?: boolean;
}

interface TransactionBoxProps {
  title: string;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export const TransactionBox = ({ title, transactions, onEdit, onDelete }: TransactionBoxProps) => {
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
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CategoryIcon category={transaction.category} className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
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