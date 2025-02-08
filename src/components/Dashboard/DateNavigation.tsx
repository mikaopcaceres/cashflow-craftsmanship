
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS } from "@/types/transaction";

interface DateNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onYearChange: (year: string) => void;
}

export const DateNavigation = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onYearChange,
}: DateNavigationProps) => {
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYearNum - 5 + i);

  return (
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
      <Button variant="ghost" onClick={onPreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-4">
        <span className="text-lg font-medium">
          {MONTHS[currentDate.getMonth()]}
        </span>
        
        <Select
          value={currentDate.getFullYear().toString()}
          onValueChange={onYearChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" onClick={onNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

