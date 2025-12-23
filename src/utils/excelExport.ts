import * as XLSX from 'xlsx';
import { ExpenseRecord, AdvanceRecord, MonthlySummary, CategorySummary } from '@/data/expenseData';

interface ExportData {
  expenses: ExpenseRecord[];
  advances: AdvanceRecord[];
  monthlySummary: MonthlySummary[];
  categorySummary: CategorySummary[];
  totals: {
    totalExpenses: number;
    totalAdvances: number;
    balance: number;
  };
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const applyHeaderStyle = (ws: XLSX.WorkSheet, range: string) => {
  // Note: xlsx library has limited styling support in the free version
  // Colors are applied through cell formatting
  return ws;
};

export const exportToExcel = (data: ExportData): void => {
  const wb = XLSX.utils.book_new();

  // ========== SHEET 1: EXPENSE RECORDS ==========
  const expenseHeaders = [
    ['EXPENSE RECORDS - DETAILED TRACKING'],
    [''],
    ['#', 'Date', 'Description', 'Amount (₹)', 'Category', 'Paid By', 'Bill', 'Notes']
  ];

  const expenseRows = data.expenses.map((exp, idx) => [
    idx + 1,
    formatDate(exp.date),
    exp.description,
    exp.amount,
    exp.category.toUpperCase(),
    exp.paidBy,
    exp.bill || '-',
    exp.notes || '-'
  ]);

  // Add total row
  const totalExpenseRow = [
    '',
    '',
    'TOTAL EXPENSES',
    data.totals.totalExpenses,
    '',
    '',
    '',
    ''
  ];

  const expenseData = [...expenseHeaders, ...expenseRows, [''], totalExpenseRow];
  const wsExpenses = XLSX.utils.aoa_to_sheet(expenseData);

  // Set column widths
  wsExpenses['!cols'] = [
    { wch: 6 },   // #
    { wch: 14 },  // Date
    { wch: 35 },  // Description
    { wch: 14 },  // Amount
    { wch: 12 },  // Category
    { wch: 10 },  // Paid By
    { wch: 10 },  // Bill
    { wch: 20 }   // Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

  // ========== SHEET 2: ADVANCE RECORDS ==========
  const advanceHeaders = [
    ['ADVANCE RECORDS'],
    [''],
    ['#', 'Date', 'Person', 'Amount (₹)', 'Notes']
  ];

  const advanceRows = data.advances.map((adv, idx) => [
    idx + 1,
    formatDate(adv.date),
    adv.person,
    adv.amount,
    adv.notes || '-'
  ]);

  const totalAdvanceRow = ['', '', 'TOTAL ADVANCES', data.totals.totalAdvances, ''];

  const advanceDataSheet = [...advanceHeaders, ...advanceRows, [''], totalAdvanceRow];
  const wsAdvances = XLSX.utils.aoa_to_sheet(advanceDataSheet);

  wsAdvances['!cols'] = [
    { wch: 6 },   // #
    { wch: 14 },  // Date
    { wch: 15 },  // Person
    { wch: 14 },  // Amount
    { wch: 35 }   // Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsAdvances, 'Advances');

  // ========== SHEET 3: MONTHLY SUMMARY ==========
  const monthlyHeaders = [
    ['MONTHLY SUMMARY - WITH CARRY FORWARD'],
    [''],
    ['Month', 'Total Expenses (₹)', 'Total Advances (₹)', 'Balance (₹)', 'Status', 'Carry Forward (₹)']
  ];

  let carryForward = 0;
  const monthlyRows = data.monthlySummary.map(summary => {
    const currentBalance = summary.balance;
    const prevCarry = carryForward;
    carryForward = currentBalance;
    return [
      summary.month,
      summary.totalExpenses,
      summary.totalAdvances,
      currentBalance,
      summary.status,
      currentBalance > 0 ? currentBalance : 0
    ];
  });

  // Grand totals
  const grandTotalExpenses = data.monthlySummary.reduce((sum, m) => sum + m.totalExpenses, 0);
  const grandTotalAdvances = data.monthlySummary.reduce((sum, m) => sum + m.totalAdvances, 0);
  const grandBalance = grandTotalAdvances - grandTotalExpenses;

  const grandTotalRow = [
    'GRAND TOTAL',
    grandTotalExpenses,
    grandTotalAdvances,
    grandBalance,
    grandBalance >= 0 ? 'ADVANCE LEFT' : 'EXPENSE EXCEEDED',
    ''
  ];

  const monthlyDataSheet = [...monthlyHeaders, ...monthlyRows, [''], grandTotalRow];
  const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyDataSheet);

  wsMonthly['!cols'] = [
    { wch: 12 },  // Month
    { wch: 18 },  // Expenses
    { wch: 18 },  // Advances
    { wch: 14 },  // Balance
    { wch: 18 },  // Status
    { wch: 16 }   // Carry Forward
  ];

  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly Summary');

  // ========== SHEET 4: CATEGORY BREAKDOWN ==========
  const categoryHeaders = [
    ['CATEGORY-WISE EXPENSE BREAKDOWN'],
    [''],
    ['#', 'Category', 'Total Amount (₹)', 'No. of Transactions', 'Percentage (%)']
  ];

  const categoryRows = data.categorySummary.map((cat, idx) => [
    idx + 1,
    cat.category.toUpperCase(),
    cat.amount,
    cat.count,
    cat.percentage.toFixed(1) + '%'
  ]);

  const categoryTotalRow = [
    '',
    'TOTAL',
    data.totals.totalExpenses,
    data.expenses.length,
    '100%'
  ];

  const categoryDataSheet = [...categoryHeaders, ...categoryRows, [''], categoryTotalRow];
  const wsCategory = XLSX.utils.aoa_to_sheet(categoryDataSheet);

  wsCategory['!cols'] = [
    { wch: 6 },   // #
    { wch: 15 },  // Category
    { wch: 18 },  // Amount
    { wch: 20 },  // Transactions
    { wch: 14 }   // Percentage
  ];

  XLSX.utils.book_append_sheet(wb, wsCategory, 'Categories');

  // ========== SHEET 5: DASHBOARD SUMMARY ==========
  const dashboardData = [
    ['EXPENSE TRACKER - DASHBOARD SUMMARY'],
    [''],
    ['Generated On:', new Date().toLocaleString('en-IN')],
    ['Period:', 'Aug 2025 - Nov 2025'],
    [''],
    ['KEY METRICS'],
    [''],
    ['Metric', 'Value'],
    ['Total Expense Records', data.expenses.length],
    ['Total Advance Records', data.advances.length],
    [''],
    ['FINANCIAL SUMMARY'],
    [''],
    ['Description', 'Amount (₹)'],
    ['Total Expenses', data.totals.totalExpenses],
    ['Total Advances', data.totals.totalAdvances],
    ['Current Balance', data.totals.balance],
    ['Balance Status', data.totals.balance >= 0 ? 'ADVANCE REMAINING' : 'EXPENSE EXCEEDED'],
    [''],
    ['CATEGORY BREAKDOWN'],
    [''],
    ['Category', 'Amount (₹)', 'Count', 'Share'],
    ...data.categorySummary.map(cat => [
      cat.category.toUpperCase(),
      cat.amount,
      cat.count,
      cat.percentage.toFixed(1) + '%'
    ]),
    [''],
    ['TOP 3 EXPENSE CATEGORIES'],
    ...data.categorySummary.slice(0, 3).map((cat, idx) => [
      `${idx + 1}. ${cat.category.toUpperCase()}`,
      cat.amount,
      `${cat.percentage.toFixed(1)}%`
    ])
  ];

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);

  wsDashboard['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Expense_Tracker_Report_${timestamp}.xlsx`;

  // Write and download
  XLSX.writeFile(wb, filename);
};
