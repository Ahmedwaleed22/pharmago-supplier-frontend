import { formatPrescriptionDate } from "./prescriptions";

/**
 * Escape a value for CSV to handle commas, quotes, etc.
 * @param value The value to escape
 * @returns The escaped value
 */
function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Convert to string and handle empty values
  const stringValue = String(value);
  if (!stringValue) return '';
  
  // If the value contains quotes, commas, or newlines, wrap it in quotes
  // and escape any existing quotes by doubling them
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Convert an array of orders to CSV format
 * @param orders The orders to convert to CSV
 * @returns string CSV content
 */
export function convertOrdersToCSV(orders: Prescription.Prescription[]) {
  if (!orders || orders.length === 0) return '';

  // CSV headers
  const headers = ['ID', 'Patient Name', 'Request Type', 'Status', 'Date'];
  
  // Convert data to CSV rows
  const rows = orders.map(order => [
    escapeCSV(order.id),
    escapeCSV(order.patient?.name),
    escapeCSV(order.prescription_text ? 'Prescription / Rx' : 'N/A'),
    escapeCSV(order.status),
    escapeCSV(order.created_at ? formatPrescriptionDate(order.created_at, false) : '')
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Download CSV data as a file
 * @param csvContent The CSV content to download
 * @param filename The name of the file to download
 */
export function downloadCSV(csvContent: string, filename: string = 'order-history.csv') {
  try {
    // Add BOM for Excel to properly recognize UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error downloading CSV:", error);
  }
}

/**
 * Convenience function to directly export order data to CSV
 * 
 * @param orders All available orders
 * @param selectedIds Optional array of selected order IDs to filter
 * @param onlySelected Whether to export only selected orders
 * @returns void
 */
export function exportOrdersToCsv(
  orders: Prescription.Prescription[], 
  selectedIds: string[] = [], 
  onlySelected: boolean = false
): void {
  try {
    if (!orders || orders.length === 0) {
      console.error("No orders available to export");
      return;
    }
    
    let dataToExport = orders;
    
    // If only selected items should be exported and there are selected ids
    if (onlySelected && selectedIds.length > 0) {
      dataToExport = orders.filter(order => 
        order && order.id && selectedIds.includes(order.id)
      );
      
      if (dataToExport.length === 0) {
        console.error("No matching orders found for the selected IDs");
        return;
      }
      
      console.log(`Exporting ${dataToExport.length} selected items`);
    } else {
      console.log(`Exporting all ${dataToExport.length} items`);
    }
    
    const csvContent = convertOrdersToCSV(dataToExport);
    if (!csvContent) {
      console.error("Failed to generate CSV content");
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadCSV(csvContent, `order-history-${onlySelected ? 'selected' : 'all'}-${timestamp}.csv`);
  } catch (error) {
    console.error("Error exporting orders to CSV:", error);
  }
} 