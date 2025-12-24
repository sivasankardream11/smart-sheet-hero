import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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

// Color palette matching UI
const COLORS = {
  primary: { argb: 'FF6366F1' },      // Indigo
  primaryDark: { argb: 'FF4F46E5' },
  success: { argb: 'FF10B981' },       // Green
  successLight: { argb: 'FFD1FAE5' },
  danger: { argb: 'FFEF4444' },        // Red
  dangerLight: { argb: 'FFFEE2E2' },
  warning: { argb: 'FFF59E0B' },       // Amber
  warningLight: { argb: 'FFFEF3C7' },
  info: { argb: 'FF3B82F6' },          // Blue
  infoLight: { argb: 'FFDBEAFE' },
  purple: { argb: 'FF8B5CF6' },
  purpleLight: { argb: 'FFEDE9FE' },
  pink: { argb: 'FFEC4899' },
  pinkLight: { argb: 'FFFCE7F3' },
  orange: { argb: 'FFF97316' },
  orangeLight: { argb: 'FFFFEDD5' },
  teal: { argb: 'FF14B8A6' },
  tealLight: { argb: 'FFCCFBF1' },
  headerBg: { argb: 'FF1E293B' },      // Slate 800
  headerText: { argb: 'FFFFFFFF' },
  altRowBg: { argb: 'FFF8FAFC' },      // Slate 50
  borderColor: { argb: 'FFE2E8F0' },   // Slate 200
  white: { argb: 'FFFFFFFF' },
  black: { argb: 'FF000000' },
  slate600: { argb: 'FF475569' },
  slate700: { argb: 'FF334155' },
};

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: { argb: string }, text: { argb: string } }> = {
  food: { bg: COLORS.orangeLight, text: COLORS.orange },
  travel: { bg: COLORS.infoLight, text: COLORS.info },
  hotel: { bg: COLORS.purpleLight, text: COLORS.purple },
  fuel: { bg: COLORS.warningLight, text: COLORS.warning },
  other: { bg: { argb: 'FFF1F5F9' }, text: COLORS.slate600 },
  coolie: { bg: COLORS.tealLight, text: COLORS.teal },
  auto: { bg: COLORS.pinkLight, text: COLORS.pink },
  toll: { bg: COLORS.successLight, text: COLORS.success },
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

const setHeaderStyle = (row: ExcelJS.Row, colCount: number) => {
  row.height = 28;
  row.eachCell((cell, colNumber) => {
    if (colNumber <= colCount) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: COLORS.headerBg
      };
      cell.font = {
        bold: true,
        color: COLORS.headerText,
        size: 11,
        name: 'Calibri'
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: COLORS.borderColor },
        bottom: { style: 'thin', color: COLORS.borderColor },
        left: { style: 'thin', color: COLORS.borderColor },
        right: { style: 'thin', color: COLORS.borderColor }
      };
    }
  });
};

const setTitleStyle = (cell: ExcelJS.Cell, color: { argb: string }) => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: color
  };
  cell.font = {
    bold: true,
    color: COLORS.white,
    size: 14,
    name: 'Calibri'
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
};

const setDataRowStyle = (row: ExcelJS.Row, colCount: number, isAlt: boolean) => {
  row.height = 22;
  row.eachCell((cell, colNumber) => {
    if (colNumber <= colCount) {
      if (isAlt) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: COLORS.altRowBg
        };
      }
      cell.font = { size: 10, name: 'Calibri', color: COLORS.slate700 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        bottom: { style: 'thin', color: COLORS.borderColor }
      };
    }
  });
};

const setTotalRowStyle = (row: ExcelJS.Row, colCount: number) => {
  row.height = 26;
  row.eachCell((cell, colNumber) => {
    if (colNumber <= colCount) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: COLORS.primary
      };
      cell.font = {
        bold: true,
        color: COLORS.white,
        size: 11,
        name: 'Calibri'
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium', color: COLORS.primaryDark },
        bottom: { style: 'medium', color: COLORS.primaryDark }
      };
    }
  });
};

const setCategoryStyle = (cell: ExcelJS.Cell, category: string) => {
  const colorSet = CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: colorSet.bg
  };
  cell.font = {
    bold: true,
    color: colorSet.text,
    size: 10,
    name: 'Calibri'
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.border = {
    top: { style: 'thin', color: colorSet.bg },
    bottom: { style: 'thin', color: colorSet.bg },
    left: { style: 'thin', color: colorSet.bg },
    right: { style: 'thin', color: colorSet.bg }
  };
};

const setStatusStyle = (cell: ExcelJS.Cell, status: string) => {
  const isAdvance = status.toLowerCase().includes('advance');
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: isAdvance ? COLORS.successLight : COLORS.dangerLight
  };
  cell.font = {
    bold: true,
    color: isAdvance ? COLORS.success : COLORS.danger,
    size: 10,
    name: 'Calibri'
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
};

export const exportToExcel = async (data: ExportData): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Expense Tracker';
  workbook.created = new Date();

  // ========== SHEET 1: EXPENSE RECORDS ==========
  const wsExpenses = workbook.addWorksheet('Expenses', {
    properties: { tabColor: { argb: 'FF6366F1' } }
  });

  // Title row
  wsExpenses.mergeCells('A1:H1');
  const expenseTitle = wsExpenses.getCell('A1');
  expenseTitle.value = '📊 EXPENSE RECORDS - DETAILED TRACKING';
  setTitleStyle(expenseTitle, COLORS.primary);
  wsExpenses.getRow(1).height = 35;

  // Empty row
  wsExpenses.addRow([]);

  // Headers
  const expenseHeaders = ['#', 'Date', 'Description', 'Amount (₹)', 'Category', 'Paid By', 'Bill', 'Notes'];
  const headerRow = wsExpenses.addRow(expenseHeaders);
  setHeaderStyle(headerRow, 8);

  // Data rows
  data.expenses.forEach((exp, idx) => {
    const row = wsExpenses.addRow([
      idx + 1,
      formatDate(exp.date),
      exp.description,
      exp.amount,
      exp.category.toUpperCase(),
      exp.paidBy,
      exp.bill || '-',
      exp.notes || '-'
    ]);
    setDataRowStyle(row, 8, idx % 2 === 1);
    
    // Style category cell
    const categoryCell = row.getCell(5);
    setCategoryStyle(categoryCell, exp.category);
    
    // Style amount cell
    const amountCell = row.getCell(4);
    amountCell.numFmt = '₹#,##0';
    amountCell.alignment = { vertical: 'middle', horizontal: 'right' };
  });

  // Empty row before total
  wsExpenses.addRow([]);

  // Total row
  const totalExpenseRow = wsExpenses.addRow([
    '', '', 'TOTAL EXPENSES', data.totals.totalExpenses, '', '', '', ''
  ]);
  setTotalRowStyle(totalExpenseRow, 8);
  totalExpenseRow.getCell(4).numFmt = '₹#,##0';

  // Column widths
  wsExpenses.columns = [
    { width: 6 },   // #
    { width: 14 },  // Date
    { width: 40 },  // Description
    { width: 15 },  // Amount
    { width: 12 },  // Category
    { width: 10 },  // Paid By
    { width: 12 },  // Bill
    { width: 25 }   // Notes
  ];

  // ========== SHEET 2: ADVANCE RECORDS ==========
  const wsAdvances = workbook.addWorksheet('Advances', {
    properties: { tabColor: { argb: 'FF10B981' } }
  });

  wsAdvances.mergeCells('A1:E1');
  const advanceTitle = wsAdvances.getCell('A1');
  advanceTitle.value = '💰 ADVANCE RECORDS';
  setTitleStyle(advanceTitle, COLORS.success);
  wsAdvances.getRow(1).height = 35;

  wsAdvances.addRow([]);

  const advanceHeaders = ['#', 'Date', 'Person', 'Amount (₹)', 'Notes'];
  const advanceHeaderRow = wsAdvances.addRow(advanceHeaders);
  setHeaderStyle(advanceHeaderRow, 5);

  data.advances.forEach((adv, idx) => {
    const row = wsAdvances.addRow([
      idx + 1,
      formatDate(adv.date),
      adv.person,
      adv.amount,
      adv.notes || '-'
    ]);
    setDataRowStyle(row, 5, idx % 2 === 1);
    
    row.getCell(4).numFmt = '₹#,##0';
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
    
    // Highlight amount in green
    row.getCell(4).font = { bold: true, color: COLORS.success, size: 10 };
  });

  wsAdvances.addRow([]);

  const totalAdvanceRow = wsAdvances.addRow([
    '', '', 'TOTAL ADVANCES', data.totals.totalAdvances, ''
  ]);
  setTotalRowStyle(totalAdvanceRow, 5);
  totalAdvanceRow.getCell(4).numFmt = '₹#,##0';
  totalAdvanceRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: COLORS.success };

  wsAdvances.columns = [
    { width: 6 },
    { width: 14 },
    { width: 15 },
    { width: 15 },
    { width: 40 }
  ];

  // ========== SHEET 3: MONTHLY SUMMARY ==========
  const wsMonthly = workbook.addWorksheet('Monthly Summary', {
    properties: { tabColor: { argb: 'FF3B82F6' } }
  });

  wsMonthly.mergeCells('A1:F1');
  const monthlyTitle = wsMonthly.getCell('A1');
  monthlyTitle.value = '📅 MONTHLY SUMMARY - WITH CARRY FORWARD';
  setTitleStyle(monthlyTitle, COLORS.info);
  wsMonthly.getRow(1).height = 35;

  wsMonthly.addRow([]);

  const monthlyHeaders = ['Month', 'Total Expenses (₹)', 'Total Advances (₹)', 'Balance (₹)', 'Status', 'Carry Forward (₹)'];
  const monthlyHeaderRow = wsMonthly.addRow(monthlyHeaders);
  setHeaderStyle(monthlyHeaderRow, 6);

  data.monthlySummary.forEach((summary, idx) => {
    const row = wsMonthly.addRow([
      summary.month,
      summary.totalExpenses,
      summary.totalAdvances,
      summary.balance,
      summary.status,
      summary.balance > 0 ? summary.balance : 0
    ]);
    setDataRowStyle(row, 6, idx % 2 === 1);

    // Format currency columns
    [2, 3, 4, 6].forEach(col => {
      row.getCell(col).numFmt = '₹#,##0';
      row.getCell(col).alignment = { vertical: 'middle', horizontal: 'right' };
    });

    // Style balance based on positive/negative
    const balanceCell = row.getCell(4);
    balanceCell.font = {
      bold: true,
      color: summary.balance >= 0 ? COLORS.success : COLORS.danger,
      size: 10
    };

    // Style status cell
    setStatusStyle(row.getCell(5), summary.status);
  });

  wsMonthly.addRow([]);

  const grandTotalExpenses = data.monthlySummary.reduce((sum, m) => sum + m.totalExpenses, 0);
  const grandTotalAdvances = data.monthlySummary.reduce((sum, m) => sum + m.totalAdvances, 0);
  const grandBalance = grandTotalAdvances - grandTotalExpenses;

  const grandTotalRow = wsMonthly.addRow([
    'GRAND TOTAL',
    grandTotalExpenses,
    grandTotalAdvances,
    grandBalance,
    grandBalance >= 0 ? 'ADVANCE LEFT' : 'EXPENSE EXCEEDED',
    ''
  ]);
  setTotalRowStyle(grandTotalRow, 6);
  [2, 3, 4].forEach(col => {
    grandTotalRow.getCell(col).numFmt = '₹#,##0';
  });

  wsMonthly.columns = [
    { width: 12 },
    { width: 18 },
    { width: 18 },
    { width: 15 },
    { width: 18 },
    { width: 18 }
  ];

  // ========== SHEET 4: CATEGORY BREAKDOWN ==========
  const wsCategory = workbook.addWorksheet('Categories', {
    properties: { tabColor: { argb: 'FF8B5CF6' } }
  });

  wsCategory.mergeCells('A1:E1');
  const categoryTitle = wsCategory.getCell('A1');
  categoryTitle.value = '🏷️ CATEGORY-WISE EXPENSE BREAKDOWN';
  setTitleStyle(categoryTitle, COLORS.purple);
  wsCategory.getRow(1).height = 35;

  wsCategory.addRow([]);

  const categoryHeaders = ['#', 'Category', 'Total Amount (₹)', 'Transactions', 'Percentage'];
  const categoryHeaderRow = wsCategory.addRow(categoryHeaders);
  setHeaderStyle(categoryHeaderRow, 5);

  data.categorySummary.forEach((cat, idx) => {
    const row = wsCategory.addRow([
      idx + 1,
      cat.category.toUpperCase(),
      cat.amount,
      cat.count,
      cat.percentage.toFixed(1) + '%'
    ]);
    setDataRowStyle(row, 5, idx % 2 === 1);

    // Style category cell with color
    setCategoryStyle(row.getCell(2), cat.category);

    row.getCell(3).numFmt = '₹#,##0';
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };

    // Progress bar style for percentage
    const percentCell = row.getCell(5);
    const percentValue = cat.percentage;
    if (percentValue > 30) {
      percentCell.font = { bold: true, color: COLORS.danger, size: 10 };
    } else if (percentValue > 15) {
      percentCell.font = { bold: true, color: COLORS.warning, size: 10 };
    } else {
      percentCell.font = { bold: true, color: COLORS.success, size: 10 };
    }
  });

  wsCategory.addRow([]);

  const categoryTotalRow = wsCategory.addRow([
    '', 'TOTAL', data.totals.totalExpenses, data.expenses.length, '100%'
  ]);
  setTotalRowStyle(categoryTotalRow, 5);
  categoryTotalRow.getCell(3).numFmt = '₹#,##0';

  wsCategory.columns = [
    { width: 6 },
    { width: 15 },
    { width: 18 },
    { width: 14 },
    { width: 12 }
  ];

  // ========== SHEET 5: DASHBOARD SUMMARY ==========
  const wsDashboard = workbook.addWorksheet('Dashboard', {
    properties: { tabColor: { argb: 'FFEF4444' } }
  });

  // Title
  wsDashboard.mergeCells('A1:D1');
  const dashTitle = wsDashboard.getCell('A1');
  dashTitle.value = '📈 EXPENSE TRACKER - DASHBOARD SUMMARY';
  setTitleStyle(dashTitle, COLORS.danger);
  wsDashboard.getRow(1).height = 40;

  wsDashboard.addRow([]);

  // Info section
  const infoRow1 = wsDashboard.addRow(['Generated On:', new Date().toLocaleString('en-IN'), '', '']);
  infoRow1.getCell(1).font = { bold: true, size: 10, color: COLORS.slate600 };
  infoRow1.getCell(2).font = { size: 10, color: COLORS.slate700 };

  const infoRow2 = wsDashboard.addRow(['Period:', 'Aug 2025 - Nov 2025', '', '']);
  infoRow2.getCell(1).font = { bold: true, size: 10, color: COLORS.slate600 };
  infoRow2.getCell(2).font = { size: 10, color: COLORS.slate700 };

  wsDashboard.addRow([]);

  // Key Metrics Section
  wsDashboard.mergeCells('A6:D6');
  const metricsTitle = wsDashboard.getCell('A6');
  metricsTitle.value = '📊 KEY METRICS';
  metricsTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: COLORS.info };
  metricsTitle.font = { bold: true, color: COLORS.white, size: 12 };
  metricsTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDashboard.getRow(6).height = 28;

  wsDashboard.addRow([]);

  const metricsHeaders = wsDashboard.addRow(['Metric', 'Value', '', '']);
  setHeaderStyle(metricsHeaders, 2);

  const metric1 = wsDashboard.addRow(['Total Expense Records', data.expenses.length, '', '']);
  setDataRowStyle(metric1, 2, false);
  metric1.getCell(2).font = { bold: true, color: COLORS.primary, size: 11 };

  const metric2 = wsDashboard.addRow(['Total Advance Records', data.advances.length, '', '']);
  setDataRowStyle(metric2, 2, true);
  metric2.getCell(2).font = { bold: true, color: COLORS.success, size: 11 };

  wsDashboard.addRow([]);

  // Financial Summary Section
  wsDashboard.mergeCells('A12:D12');
  const finTitle = wsDashboard.getCell('A12');
  finTitle.value = '💵 FINANCIAL SUMMARY';
  finTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: COLORS.success };
  finTitle.font = { bold: true, color: COLORS.white, size: 12 };
  finTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDashboard.getRow(12).height = 28;

  wsDashboard.addRow([]);

  const finHeaders = wsDashboard.addRow(['Description', 'Amount (₹)', '', '']);
  setHeaderStyle(finHeaders, 2);

  const fin1 = wsDashboard.addRow(['Total Expenses', data.totals.totalExpenses, '', '']);
  setDataRowStyle(fin1, 2, false);
  fin1.getCell(2).numFmt = '₹#,##0';
  fin1.getCell(2).font = { bold: true, color: COLORS.danger, size: 11 };

  const fin2 = wsDashboard.addRow(['Total Advances', data.totals.totalAdvances, '', '']);
  setDataRowStyle(fin2, 2, true);
  fin2.getCell(2).numFmt = '₹#,##0';
  fin2.getCell(2).font = { bold: true, color: COLORS.success, size: 11 };

  const fin3 = wsDashboard.addRow(['Current Balance', data.totals.balance, '', '']);
  fin3.getCell(1).font = { bold: true, size: 11 };
  fin3.getCell(2).numFmt = '₹#,##0';
  fin3.getCell(2).font = { bold: true, color: data.totals.balance >= 0 ? COLORS.success : COLORS.danger, size: 12 };
  fin3.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: data.totals.balance >= 0 ? COLORS.successLight : COLORS.dangerLight };

  const fin4 = wsDashboard.addRow(['Status', data.totals.balance >= 0 ? '✅ ADVANCE REMAINING' : '❌ EXPENSE EXCEEDED', '', '']);
  setStatusStyle(fin4.getCell(2), data.totals.balance >= 0 ? 'advance' : 'exceeded');

  wsDashboard.addRow([]);

  // Top Categories Section
  wsDashboard.mergeCells('A20:D20');
  const topTitle = wsDashboard.getCell('A20');
  topTitle.value = '🏆 TOP 3 EXPENSE CATEGORIES';
  topTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: COLORS.warning };
  topTitle.font = { bold: true, color: COLORS.white, size: 12 };
  topTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDashboard.getRow(20).height = 28;

  wsDashboard.addRow([]);

  const topHeaders = wsDashboard.addRow(['Rank', 'Category', 'Amount (₹)', 'Share']);
  setHeaderStyle(topHeaders, 4);

  data.categorySummary.slice(0, 3).forEach((cat, idx) => {
    const row = wsDashboard.addRow([
      idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉',
      cat.category.toUpperCase(),
      cat.amount,
      cat.percentage.toFixed(1) + '%'
    ]);
    setDataRowStyle(row, 4, idx % 2 === 1);
    setCategoryStyle(row.getCell(2), cat.category);
    row.getCell(3).numFmt = '₹#,##0';
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'center' };
  });

  wsDashboard.columns = [
    { width: 20 },
    { width: 20 },
    { width: 18 },
    { width: 12 }
  ];

  // Generate and download
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Expense_Tracker_Report_${timestamp}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.xml' });
  saveAs(blob, filename);
};
