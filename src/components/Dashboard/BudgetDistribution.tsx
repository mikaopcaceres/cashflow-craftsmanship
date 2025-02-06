import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";

interface BudgetDistributionProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const BudgetDistribution = ({ data }: BudgetDistributionProps) => {
  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Distribuição do Orçamento</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};