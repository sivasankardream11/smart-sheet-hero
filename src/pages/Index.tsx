import { useState, useMemo } from "react";
import { expenseData, advanceData } from "@/data/expenseData";
import { 
  calculateTotalExpenses, 
  calculateTotalAdvances, 
  calculateCategorySummary, 
  calculateMonthlySummary,
  filterExpensesByMonth,
  filterExpensesByCategory,
  filterAdvancesByMonth,
  formatCurrency
} from "@/utils/calculations";
import { exportToExcel } from "@/utils/excelExport";
import { StatCard } from "@/components/StatCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { AdvanceTable } from "@/components/AdvanceTable";
import { MonthlySummaryTable } from "@/components/MonthlySummaryTable";
import { CategorySummaryChart } from "@/components/CategorySummaryChart";
import { FilterBar } from "@/components/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  Wallet, 
  TrendingUp, 
  Calculator,
  FileSpreadsheet,
  PiggyBank,
  BarChart3,
  Calendar,
  Download
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Apply filters
  const filteredExpenses = useMemo(() => {
    let result = expenseData;
    result = filterExpensesByMonth(result, selectedMonth);
    result = filterExpensesByCategory(result, selectedCategory);
    return result;
  }, [selectedMonth, selectedCategory]);

  const filteredAdvances = useMemo(() => {
    return filterAdvancesByMonth(advanceData, selectedMonth);
  }, [selectedMonth]);

  // Calculate summaries
  const totalExpenses = calculateTotalExpenses(filteredExpenses);
  const totalAdvances = calculateTotalAdvances(filteredAdvances);
  const balance = totalAdvances - totalExpenses;
  const categorySummary = calculateCategorySummary(filteredExpenses);
  const monthlySummary = calculateMonthlySummary(expenseData, advanceData);

  // Overall totals
  const overallExpenses = calculateTotalExpenses(expenseData);
  const overallAdvances = calculateTotalAdvances(advanceData);
  const overallBalance = overallAdvances - overallExpenses;

  const handleDownloadExcel = async () => {
    try {
      await exportToExcel({
        expenses: expenseData,
        advances: advanceData,
        monthlySummary,
        categorySummary: calculateCategorySummary(expenseData),
        totals: {
          totalExpenses: overallExpenses,
          totalAdvances: overallAdvances,
          balance: overallBalance
        }
      });
      toast.success("Colorful Excel file downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download Excel file");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Expense Tracker</h1>
              <p className="text-xs text-muted-foreground">Auto-calculated expense & advance dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleDownloadExcel}
              className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Aug - Nov 2025</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Overall Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(overallExpenses)}
            subtitle={`${expenseData.length} transactions`}
            icon={<Receipt className="h-5 w-5 text-destructive" />}
            variant="destructive"
          />
          <StatCard
            title="Total Advances"
            value={formatCurrency(overallAdvances)}
            subtitle={`${advanceData.length} advances received`}
            icon={<Wallet className="h-5 w-5 text-success" />}
            variant="success"
          />
          <StatCard
            title="Current Balance"
            value={formatCurrency(Math.abs(overallBalance))}
            subtitle={overallBalance >= 0 ? "Advance remaining" : "Expense exceeded"}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            variant={overallBalance >= 0 ? "primary" : "warning"}
          />
          <StatCard
            title="Avg Daily Expense"
            value={formatCurrency(Math.round(overallExpenses / 122))}
            subtitle="~122 days tracked"
            icon={<Calculator className="h-5 w-5 text-muted-foreground" />}
          />
        </section>

        {/* Filters */}
        <FilterBar
          selectedMonth={selectedMonth}
          selectedCategory={selectedCategory}
          onMonthChange={setSelectedMonth}
          onCategoryChange={setSelectedCategory}
        />

        {/* Filtered Stats */}
        {(selectedMonth !== "all" || selectedCategory !== "all") && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Filtered Expenses"
              value={formatCurrency(totalExpenses)}
              subtitle={`${filteredExpenses.length} records`}
              variant="destructive"
            />
            <StatCard
              title="Filtered Advances"
              value={formatCurrency(totalAdvances)}
              subtitle={`${filteredAdvances.length} advances`}
              variant="success"
            />
            <StatCard
              title="Filtered Balance"
              value={formatCurrency(Math.abs(balance))}
              subtitle={balance >= 0 ? "Advance remaining" : "Expense exceeded"}
              variant={balance >= 0 ? "primary" : "warning"}
            />
          </section>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="advances" className="gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">Advances</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Monthly</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Expense Records</h2>
              <span className="text-sm text-muted-foreground">
                Showing {filteredExpenses.length} of {expenseData.length} records
              </span>
            </div>
            <ExpenseTable expenses={filteredExpenses} />
          </TabsContent>

          <TabsContent value="advances" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Advance Records</h2>
              <span className="text-sm text-muted-foreground">
                {filteredAdvances.length} advances
              </span>
            </div>
            <div className="max-w-2xl">
              <AdvanceTable advances={filteredAdvances} />
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <h2 className="text-lg font-semibold">Monthly Summary</h2>
            <p className="text-sm text-muted-foreground">
              Note: Pending advances are carried forward to the next month. 
              Carried-forward advances are deducted from total expenses.
            </p>
            <MonthlySummaryTable summaries={monthlySummary} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <h2 className="text-lg font-semibold">Category Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategorySummaryChart categories={categorySummary} />
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Category Details
                </h3>
                <div className="space-y-2">
                  {categorySummary.map((cat, index) => (
                    <div 
                      key={cat.category}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-6">
                          {index + 1}.
                        </span>
                        <span className="text-sm capitalize font-medium">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {cat.count} items
                        </span>
                        <span className="font-mono font-semibold text-sm">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="container px-4 py-4 text-center text-sm text-muted-foreground">
          <p>Expense & Advance Dashboard • Auto-calculated from {expenseData.length} expense records</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
