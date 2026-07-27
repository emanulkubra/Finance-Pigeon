import { Transaction, Goal, Budget, UserSettings } from '../types/finance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

class ExportService {
  /**
   * Export transactions to a downloadable CSV file.
   */
  exportToCSV(transactions: Transaction[], filename: string = 'Finance_Pigeon_Transactions.csv'): void {
    if (!transactions.length) return;

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Source Account', 'Destination Account', 'Merchant', 'Notes', 'AI Good Purchase', 'AI Reasoning'];
    const rows = transactions.map(tx => [
      tx.date,
      tx.type,
      `"${tx.category.replace(/"/g, '""')}"`,
      tx.amount.toFixed(2),
      tx.paymentMethod,
      `"${(tx.accountSource || '').replace(/"/g, '""')}"`,
      `"${(tx.accountDestination || '').replace(/"/g, '""')}"`,
      `"${(tx.merchant || '').replace(/"/g, '""')}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
      tx.isGoodPurchase !== undefined ? (tx.isGoodPurchase ? 'Yes' : 'No') : 'N/A',
      `"${(tx.aiReasoning || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generate and download a formatted PDF Financial Statement.
   */
  exportToPDF(
    transactions: Transaction[], 
    goals: Goal[], 
    currencySymbol: string = '$', 
    filename: string = 'Finance_Pigeon_Monthly_Report.pdf'
  ): void {
    const doc = new jsPDF();

    // Header banner
    doc.setFillColor(24, 24, 27); // Dark zinc header
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCE PIGEON', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Financial Health Statement & Transaction Ledger', 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 20);

    // Summary Section
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 14, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Monthly Income: ${currencySymbol}${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, 56);
    doc.text(`Total Monthly Expenses: ${currencySymbol}${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, 62);
    doc.text(`Net Cash Flow / Savings: ${currencySymbol}${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, 68);

    // Transactions Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction History', 14, 82);

    const tableData = transactions.slice(0, 40).map(t => [
      t.date,
      t.type.toUpperCase(),
      t.category,
      t.merchant || '-',
      t.paymentMethod.toUpperCase(),
      `${t.type === 'expense' ? '-' : '+'}${currencySymbol}${t.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 88,
      head: [['Date', 'Type', 'Category', 'Merchant', 'Method', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8 }
    });

    // Milestone Goals Table
    if (goals.length > 0) {
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 160;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Monetary Goals & Milestone Progress', 14, finalY);

      const goalData = goals.map(g => [
        g.title,
        g.category.toUpperCase(),
        `${currencySymbol}${g.currentAmount.toLocaleString()}`,
        `${currencySymbol}${g.targetAmount.toLocaleString()}`,
        `${Math.round((g.currentAmount / Math.max(1, g.targetAmount)) * 100)}%`,
        g.deadline
      ]);

      autoTable(doc, {
        startY: finalY + 6,
        head: [['Goal Title', 'Category', 'Saved', 'Target', 'Progress', 'Target Date']],
        body: goalData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }
      });
    }

    doc.save(filename);
  }

  /**
   * Export complete application state to JSON for backup.
   */
  exportFullBackup(
    transactions: Transaction[], 
    goals: Goal[], 
    budgets: Budget[], 
    settings: UserSettings
  ): void {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      goals,
      budgets,
      settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Finance_Pigeon_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const exportService = new ExportService();
