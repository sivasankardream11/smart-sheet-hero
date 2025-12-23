import { ExpenseRecord } from "@/data/expenseData";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { CategoryBadge } from "./CategoryBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ExternalLink } from "lucide-react";

interface ExpenseTableProps {
  expenses: ExpenseRecord[];
  showRowNumbers?: boolean;
}

export const ExpenseTable = ({ expenses, showRowNumbers = true }: ExpenseTableProps) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <ScrollArea className="h-[600px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="table-header-cell">
              {showRowNumbers && (
                <th className="px-3 py-3 text-left w-12">#</th>
              )}
              <th className="px-3 py-3 text-left w-28">Date</th>
              <th className="px-3 py-3 text-left min-w-[200px]">Description</th>
              <th className="px-3 py-3 text-right w-28">Amount</th>
              <th className="px-3 py-3 text-left w-24">Category</th>
              <th className="px-3 py-3 text-left w-20">Paid By</th>
              <th className="px-3 py-3 text-left w-16">Bill</th>
              <th className="px-3 py-3 text-left min-w-[100px]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr 
                key={expense.id} 
                className="table-row-striped border-b border-border/50 last:border-0"
              >
                {showRowNumbers && (
                  <td className="px-3 py-2.5 text-muted-foreground text-xs font-mono">
                    {index + 1}
                  </td>
                )}
                <td className="px-3 py-2.5 text-sm font-mono">
                  {formatDate(expense.date)}
                </td>
                <td className="px-3 py-2.5 text-sm">
                  {expense.description}
                </td>
                <td className="px-3 py-2.5 table-cell-amount text-sm font-semibold">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-3 py-2.5">
                  <CategoryBadge category={expense.category} />
                </td>
                <td className="px-3 py-2.5 text-sm capitalize">
                  {expense.paidBy}
                </td>
                <td className="px-3 py-2.5">
                  {expense.bill && expense.bill !== '' && (
                    expense.bill.startsWith('http') ? (
                      <a 
                        href={expense.bill} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-xs">{expense.bill}</span>
                      </span>
                    )
                  )}
                </td>
                <td className="px-3 py-2.5 text-sm text-muted-foreground">
                  {expense.notes}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-table-header">
            <tr className="text-table-header-foreground font-semibold">
              {showRowNumbers && <td className="px-3 py-3"></td>}
              <td className="px-3 py-3 text-sm" colSpan={2}>
                Total ({expenses.length} records)
              </td>
              <td className="px-3 py-3 table-cell-amount text-sm">
                {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </td>
              <td className="px-3 py-3" colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </ScrollArea>
    </div>
  );
};
