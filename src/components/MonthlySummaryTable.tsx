import { MonthlySummary } from "@/data/expenseData";
import { formatCurrency } from "@/utils/calculations";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlySummaryTableProps {
  summaries: MonthlySummary[];
}

export const MonthlySummaryTable = ({ summaries }: MonthlySummaryTableProps) => {
  const getStatusIcon = (status: MonthlySummary['status']) => {
    switch (status) {
      case 'ADVANCE LEFT':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'EXPENSE EXCEEDED':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: MonthlySummary['status']) => {
    switch (status) {
      case 'ADVANCE LEFT':
        return 'text-success bg-success/10';
      case 'EXPENSE EXCEEDED':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="table-header-cell">
            <th className="px-4 py-3 text-left">Month</th>
            <th className="px-4 py-3 text-right">Total Expenses</th>
            <th className="px-4 py-3 text-right">Total Advances</th>
            <th className="px-4 py-3 text-right">Balance</th>
            <th className="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => (
            <tr 
              key={summary.month} 
              className="table-row-striped border-b border-border/50 last:border-0"
            >
              <td className="px-4 py-3 text-sm font-medium">
                {summary.month}
              </td>
              <td className="px-4 py-3 table-cell-amount text-sm font-semibold text-destructive">
                {formatCurrency(summary.totalExpenses)}
              </td>
              <td className="px-4 py-3 table-cell-amount text-sm font-semibold text-success">
                {formatCurrency(summary.totalAdvances)}
              </td>
              <td className="px-4 py-3 table-cell-amount text-sm font-semibold">
                {formatCurrency(summary.balance)}
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  getStatusClass(summary.status)
                )}>
                  {getStatusIcon(summary.status)}
                  {summary.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
