import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  const normalizedCategory = category.toLowerCase();
  
  const categoryClasses: Record<string, string> = {
    food: 'category-badge category-food',
    travel: 'category-badge category-travel',
    rent: 'category-badge category-rent',
    hardware: 'category-badge category-hardware',
    colab: 'category-badge category-colab',
    labor: 'category-badge category-labor',
    vendor: 'category-badge category-vendor',
    dtdc: 'category-badge category-default',
    groceries: 'category-badge category-food',
    auto: 'category-badge category-travel',
    porter: 'category-badge category-default',
    na: 'category-badge category-default',
  };

  return (
    <span className={cn(
      categoryClasses[normalizedCategory] || 'category-badge category-default',
      className
    )}>
      {category}
    </span>
  );
};
