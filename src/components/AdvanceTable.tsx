import { AdvanceRecord } from "@/data/expenseData";
import { formatCurrency, formatDate } from "@/utils/calculations";

interface AdvanceTableProps {
  advances: AdvanceRecord[];
}

export const AdvanceTable = ({ advances }: AdvanceTableProps) => {
  const total = advances.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="table-header-cell">
            <th className="px-4 py-3 text-left w-12">#</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Person</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {advances.map((advance, index) => (
            <tr 
              key={advance.id} 
              className="table-row-striped border-b border-border/50 last:border-0"
            >
              <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                {index + 1}
              </td>
              <td className="px-4 py-3 text-sm font-mono">
                {formatDate(advance.date)}
              </td>
              <td className="px-4 py-3 text-sm capitalize">
                {advance.person}
              </td>
              <td className="px-4 py-3 table-cell-amount text-sm font-semibold text-success">
                {formatCurrency(advance.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-table-header">
          <tr className="text-table-header-foreground font-semibold">
            <td className="px-4 py-3"></td>
            <td className="px-4 py-3 text-sm" colSpan={2}>
              Total Advances
            </td>
            <td className="px-4 py-3 table-cell-amount text-sm">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
