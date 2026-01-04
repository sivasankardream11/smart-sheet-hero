import { useState, useMemo } from "react";
import { expenseDataCombined as initialExpenseData, advanceData as initialAdvanceData, hrPaymentsData as initialHRPayments, ExpenseRecord, AdvanceRecord, HRPayment } from "@/data/expenseData";
import { 
  calculateTotalExpenses, 
  calculateTotalAdvances, 
  calculateReturnableAdvances,
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
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddAdvanceDialog } from "@/components/AddAdvanceDialog";
import { AddHRPaymentDialog } from "@/components/AddHRPaymentDialog";
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
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenseData);
  const [advances, setAdvances] = useState<AdvanceRecord[]>(initialAdvanceData);
  const [hrPayments, setHRPayments] = useState<HRPayment[]>(initialHRPayments);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Apply filters
  const filteredExpenses = useMemo(() => {
    let result = expenses;
    result = filterExpensesByMonth(result, selectedMonth);
    result = filterExpensesByCategory(result, selectedCategory);
    return result;
  }, [expenses, selectedMonth, selectedCategory]);

  const filteredAdvances = useMemo(() => {
    return filterAdvancesByMonth(advances, selectedMonth);
  }, [advances, selectedMonth]);

  // Calculate summaries - now including ALL advances (regular + returnable)
  const totalExpenses = calculateTotalExpenses(filteredExpenses);
  const totalAdvances = calculateTotalAdvances(filteredAdvances, true); // Include all
  const balance = totalAdvances - totalExpenses;
  const categorySummary = calculateCategorySummary(filteredExpenses);
  const monthlySummary = calculateMonthlySummary(expenses, advances, hrPayments);

  // Overall totals - include ALL advances
  const overallExpenses = calculateTotalExpenses(expenses);
  const overallAdvances = calculateTotalAdvances(advances, true); // Include all for balance
  const returnableAdvances = calculateReturnableAdvances(advances);
  const regularAdvances = calculateTotalAdvances(advances, false);
  const totalHRPayments = hrPayments.reduce((sum, p) => sum + p.amount, 0);
  const overallBalance = overallAdvances + totalHRPayments - overallExpenses;

  // Hardware total and average daily expense (excluding hardware) over 153 days (Aug 1 - Dec 31, 2025)
  const TOTAL_DAYS = 153;
  const hardwareExpenses = expenses.filter(e => e.category.toLowerCase() === 'hardware');
  const hardwareTotal = hardwareExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesWithoutHardware = overallExpenses - hardwareTotal;
  const avgDailyExpenseWithoutHardware = Math.round(expensesWithoutHardware / TOTAL_DAYS);

  const handleAddExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      id: expenses.length + 1,
      ...expenseData
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleAddAdvance = (advanceData: Omit<AdvanceRecord, 'id'>) => {
    const newAdvance: AdvanceRecord = {
      id: advances.length + 1,
      ...advanceData
    };
    setAdvances([...advances, newAdvance]);
  };

  const handleAddHRPayment = (paymentData: Omit<HRPayment, 'id'>) => {
    const newPayment: HRPayment = {
      id: hrPayments.length + 1,
      ...paymentData
    };
    setHRPayments([...hrPayments, newPayment]);
  };

  const handleDownloadExcel = async () => {
    try {
      await exportToExcel({
        expenses,
        advances,
        monthlySummary,
        categorySummary: calculateCategorySummary(expenses),
        totals: {
          totalExpenses: overallExpenses,
          totalAdvances: regularAdvances,
          returnableAdvances: returnableAdvances,
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
          <div className="flex items-center gap-2">
            <AddExpenseDialog onAdd={handleAddExpense} />
            <AddAdvanceDialog onAdd={handleAddAdvance} />
            <AddHRPaymentDialog pendingBalance={overallBalance} onAdd={handleAddHRPayment} />
            <Button 
              onClick={handleDownloadExcel}
              className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
              <Calendar className="h-4 w-4" />
              <span>Aug - Dec 2025</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Overall Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(overallExpenses)}
            subtitle={`${expenses.length} transactions`}
            icon={<Receipt className="h-5 w-5 text-destructive" />}
            variant="destructive"
          />
          <StatCard
            title="Hardware Total"
            value={formatCurrency(hardwareTotal)}
            subtitle={`${hardwareExpenses.length} items (separate)`}
            icon={<BarChart3 className="h-5 w-5 text-orange-500" />}
            variant="warning"
          />
          <StatCard
            title="Total Advances"
            value={formatCurrency(overallAdvances)}
            subtitle={`₹${regularAdvances.toLocaleString('en-IN')} regular + ₹${returnableAdvances.toLocaleString('en-IN')} returnable`}
            icon={<Wallet className="h-5 w-5 text-success" />}
            variant="success"
          />
          <StatCard
            title="Room Advance"
            value={formatCurrency(returnableAdvances)}
            subtitle="Returnable (included in balance)"
            icon={<PiggyBank className="h-5 w-5 text-warning" />}
            variant="warning"
          />
          <StatCard
            title="Current Balance"
            value={`${overallBalance < 0 ? '-' : ''}${formatCurrency(Math.abs(overallBalance))}`}
            subtitle={overallBalance >= 0 ? "Advance remaining" : "Expense exceeded"}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            variant={overallBalance >= 0 ? "primary" : "destructive"}
          />
          <StatCard
            title="Avg Daily (No Hardware)"
            value={formatCurrency(avgDailyExpenseWithoutHardware)}
            subtitle={`${TOTAL_DAYS} days (Aug 1 - Dec 31)`}
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
                Showing {filteredExpenses.length} of {expenses.length} records
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
            <div className="max-w-3xl">
              <AdvanceTable advances={filteredAdvances} />
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <h2 className="text-lg font-semibold">Monthly Summary</h2>
            <p className="text-sm text-muted-foreground">
              Balance carries forward monthly. If HR pays the pending balance, it clears. Otherwise, negative balance carries forward.
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
          <p>Expense & Advance Dashboard • Auto-calculated from {expenses.length} expense records</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
