import { CategorySummary } from "@/data/expenseData";
import { formatCurrency } from "@/utils/calculations";
import { Progress } from "@/components/ui/progress";
import { CategoryBadge } from "./CategoryBadge";

interface CategorySummaryChartProps {
  categories: CategorySummary[];
}

export const CategorySummaryChart = ({ categories }: CategorySummaryChartProps) => {
  const maxAmount = Math.max(...categories.map(c => c.amount));

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
        Expenses by Category
      </h3>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.category} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryBadge category={category.category} />
                <span className="text-xs text-muted-foreground">
                  ({category.count} items)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold">
                  {formatCurrency(category.amount)}
                </span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress 
              value={(category.amount / maxAmount) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
