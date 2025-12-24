import { AdvanceRecord } from "@/data/expenseData";
import { formatCurrency, formatDate } from "@/utils/calculations";
import { Badge } from "@/components/ui/badge";

interface AdvanceTableProps {
  advances: AdvanceRecord[];
}

export const AdvanceTable = ({ advances }: AdvanceTableProps) => {
  const regularTotal = advances.filter(a => a.type === 'regular').reduce((sum, a) => sum + a.amount, 0);
  const returnableTotal = advances.filter(a => a.type === 'returnable').reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="table-header-cell">
            <th className="px-4 py-3 text-left w-12">#</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Person</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {advances.map((advance, index) => (
            <tr 
              key={advance.id} 
              className={`table-row-striped border-b border-border/50 last:border-0 ${advance.type === 'returnable' ? 'bg-warning/10' : ''}`}
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
              <td className={`px-4 py-3 table-cell-amount text-sm font-semibold ${advance.type === 'returnable' ? 'text-warning' : 'text-success'}`}>
                {formatCurrency(advance.amount)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={advance.type === 'returnable' ? 'outline' : 'default'} className={advance.type === 'returnable' ? 'border-warning text-warning bg-warning/10' : 'bg-success text-success-foreground'}>
                  {advance.type === 'returnable' ? 'Returnable' : 'Regular'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {advance.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-table-header">
          <tr className="text-table-header-foreground font-semibold border-b border-border/30">
            <td className="px-4 py-3"></td>
            <td className="px-4 py-3 text-sm" colSpan={2}>
              Regular Advances
            </td>
            <td className="px-4 py-3 table-cell-amount text-sm text-success">
              {formatCurrency(regularTotal)}
            </td>
            <td className="px-4 py-3" colSpan={2}></td>
          </tr>
          {returnableTotal > 0 && (
            <tr className="text-table-header-foreground font-semibold border-b border-border/30">
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-sm" colSpan={2}>
                Returnable Advances
              </td>
              <td className="px-4 py-3 table-cell-amount text-sm text-warning">
                {formatCurrency(returnableTotal)}
              </td>
              <td className="px-4 py-3" colSpan={2}></td>
            </tr>
          )}
          <tr className="text-table-header-foreground font-bold">
            <td className="px-4 py-3"></td>
            <td className="px-4 py-3 text-sm" colSpan={2}>
              Grand Total
            </td>
            <td className="px-4 py-3 table-cell-amount text-sm">
              {formatCurrency(regularTotal + returnableTotal)}
            </td>
            <td className="px-4 py-3" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
