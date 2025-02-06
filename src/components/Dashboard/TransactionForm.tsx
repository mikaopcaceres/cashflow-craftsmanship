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
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
});

interface TransactionFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export const TransactionForm = ({ onSubmit }: TransactionFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    form.reset();
    toast({
      title: "Transação adicionada com sucesso!",
      description: `${data.type === "income" ? "Receita" : "Despesa"}: ${data.description}`,
    });
  };

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

        <Button type="submit" className="w-full">
          Adicionar Transação
        </Button>
      </form>
    </Form>
  );
};