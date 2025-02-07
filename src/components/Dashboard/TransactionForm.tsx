
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  isFixed: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  installments: z.string().optional(),
  paidInstallments: z.string().optional(),
  dueDate: z.string().optional(),
});

interface TransactionFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: any;
}

export const TransactionForm = ({ onSubmit, initialData }: TransactionFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      isFixed: false,
      isRecurring: false,
      installments: "",
      paidInstallments: "0",
      dueDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        description: initialData.description,
        amount: String(initialData.amount),
        category: initialData.category,
        date: initialData.date,
        isFixed: initialData.isFixed || false,
        isRecurring: initialData.isRecurring || false,
        installments: initialData.installments?.total?.toString() || "",
        paidInstallments: initialData.installments?.paid?.toString() || "0",
        dueDate: initialData.dueDate || new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    if (!initialData) {
      form.reset();
    }
    toast({
      title: initialData ? "Transação atualizada com sucesso!" : "Transação adicionada com sucesso!",
      description: `${data.type === "income" ? "Receita" : "Despesa"}: ${data.description}`,
    });
  };

  const showFixedOption = form.watch("type") === "expense";
  const showRecurringOption = form.watch("type") === "expense" || form.watch("category") === "salary";
  const isRecurring = form.watch("isRecurring");
  const isFixed = form.watch("isFixed");
  const showInstallments = form.watch("isRecurring") && !form.watch("isFixed");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Digite a descrição" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Digite o valor"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="salary">Salário</SelectItem>
                  <SelectItem value="investment">Investimentos</SelectItem>
                  <SelectItem value="food">Alimentação</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                  <SelectItem value="housing">Moradia</SelectItem>
                  <SelectItem value="leisure">Lazer</SelectItem>
                  <SelectItem value="health">Saúde</SelectItem>
                  <SelectItem value="education">Educação</SelectItem>
                  <SelectItem value="others">Outros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showFixedOption && (
          <FormField
            control={form.control}
            name="isFixed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Despesa Fixa</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}

        {showRecurringOption && !isFixed && (
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Repetir mensalmente</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}

        {showInstallments && (
          <>
            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número total de parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Digite o número de parcelas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paidInstallments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas já pagas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Digite o número de parcelas já pagas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Vencimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar' : 'Adicionar'} Transação
        </Button>
      </form>
    </Form>
  );
};
