import { useState } from "react";
import { BalanceCard } from "@/components/Dashboard/BalanceCard";
import { BudgetDistribution } from "@/components/Dashboard/BudgetDistribution";
import { TransactionBox } from "@/components/Dashboard/TransactionBox";
import { TransactionForm } from "@/components/Dashboard/TransactionForm";
import { DateNavigation } from "@/components/Dashboard/DateNavigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@/types/transaction";
import { calculateTotals, calculateCategoryTotals, calculatePaidUnpaidTotals, formatCurrency, calculateBudgetDistribution } from "@/utils/transactionUtils";

const Index = () => {
  const { transactions, setTransactions } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<{id: number, description: string} | null>(null);
  const { toast } = useToast();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

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
      installments: data.installments && data.isRecurring && !data.isFixed ? {
        total: parseInt(data.installments),
        current: parseInt(data.paidInstallments || '0') + 1,
        paid: parseInt(data.paidInstallments || '0'),
      } : undefined,
      isPaid: data.isPaid || false,
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
        const paidInstallments = parseInt(data.paidInstallments || '0');
        
        for (let i = paidInstallments; i < months; i++) {
          const date = new Date(data.date);
          date.setMonth(date.getMonth() + i);
          
          const dueDate = new Date(data.dueDate);
          dueDate.setMonth(dueDate.getMonth() + i);

          recurringTransactions.push({
            ...newTransaction,
            id: transactions.length + 1 + i,
            date: date.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            installments: data.installments && data.isRecurring && !data.isFixed ? {
              total: months,
              current: i + 1,
              paid: paidInstallments,
            } : undefined,
            isPaid: false,
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
    setTransactions(transactions.map(t => {
      if (t.id === id) {
        const newTransaction = { ...t, isPaid: !t.isPaid };
        if (newTransaction.installments) {
          newTransaction.installments = {
            ...newTransaction.installments,
            paid: newTransaction.isPaid 
              ? Math.min(newTransaction.installments.current, newTransaction.installments.paid + 1)
              : Math.max(0, newTransaction.installments.paid - 1),
          };
        }
        return newTransaction;
      }
      return t;
    }));
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    setTransactionToDelete({
      id,
      description: transaction.description
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (deleteFuture: boolean) => {
    if (!transactionToDelete) return;
    
    const transactionToRemove = transactions.find(t => t.id === transactionToDelete.id);
    if (!transactionToRemove) return;

    if (deleteFuture) {
      if (transactionToRemove.isRecurring) {
        const transactionDate = new Date(transactionToRemove.date);
        setTransactions(transactions.filter(t => {
          if (t.description !== transactionToRemove.description) return true;
          const tDate = new Date(t.date);
          return tDate < transactionDate;
        }));
      } else {
        setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      }

      toast({
        title: "Transação excluída",
        description: "A transação e suas ocorrências futuras foram excluídas com sucesso.",
      });
    } else {
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
    }

    setTransactionToDelete(null);
    setDeleteDialogOpen(false);
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

  const totals = calculateTotals(transactions, currentMonth, currentYear);

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const budgetDistributionData = calculateBudgetDistribution(filteredTransactions);

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const fixedExpenses = filteredTransactions.filter(t => t.type === 'expense' && t.isFixed);
  const installmentExpenses = filteredTransactions.filter(t => t.type === 'expense' && !t.isFixed && t.installments);
  const dailyExpenses = filteredTransactions.filter(t => t.type === 'expense' && !t.isFixed && !t.installments);

  const incomeCategoryTotals = calculateCategoryTotals(incomeTransactions);
  const fixedExpenseCategoryTotals = calculateCategoryTotals(fixedExpenses);
  const installmentExpenseCategoryTotals = calculateCategoryTotals(installmentExpenses);
  const dailyExpenseCategoryTotals = calculateCategoryTotals(dailyExpenses);

  const fixedExpensesTotals = calculatePaidUnpaidTotals(fixedExpenses);
  const installmentExpensesTotals = calculatePaidUnpaidTotals(installmentExpenses);
  const dailyExpensesTotals = calculatePaidUnpaidTotals(dailyExpenses);

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

        <DateNavigation
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onYearChange={handleYearChange}
        />
        
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
            title={`Despesas Parceladas (Pago: ${formatCurrency(installmentExpensesTotals.paid)} | Não Pago: ${formatCurrency(installmentExpensesTotals.unpaid)})`}
            transactions={installmentExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePayment={handleTogglePayment}
            categoryTotals={installmentExpenseCategoryTotals}
            total={installmentExpenses.reduce((acc, curr) => acc + curr.amount, 0)}
          />
          <TransactionBox
            title={`Despesas do dia a dia (Pago: ${formatCurrency(dailyExpensesTotals.paid)} | Não Pago: ${formatCurrency(dailyExpensesTotals.unpaid)})`}
            transactions={dailyExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePayment={handleTogglePayment}
            categoryTotals={dailyExpenseCategoryTotals}
            total={dailyExpenses.reduce((acc, curr) => acc + curr.amount, 0)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para {editingTransaction ? 'editar a' : 'adicionar uma nova'} transação.
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleNewTransaction}
              initialData={editingTransaction}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Como deseja excluir a transação "{transactionToDelete?.description}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDeleteConfirm(false)}
              >
                Apenas este mês
              </AlertDialogAction>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDeleteConfirm(true)}
              >
                Este e próximos meses
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Index;
