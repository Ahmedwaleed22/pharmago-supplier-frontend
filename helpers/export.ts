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
 * Get the patient/customer name from different order types
 */
function getOrderCustomerName(order: any): string {
  // Handle DeliveryOrder structure
  if (order.user && typeof order.user === 'object') {
    return order.user.name || '';
  }
  
  // Handle Prescription structure
  if (order.patient && typeof order.patient === 'object') {
    return order.patient.name || '';
  }
  
  // Handle OrderHistoryItem structure
  if (order.user && typeof order.user === 'object') {
    return order.user.name || '';
  }
  
  return '';
}

/**
 * Get the request type from different order types with translation
 */
function getOrderRequestType(order: any, t?: (key: string) => string): string {
  // Handle DeliveryOrder structure
  if (order.order_type) {
    const orderType = order.order_type;
    if (t) {
      if (orderType === 'Cart Order' || orderType === 'cart') {
        return t('orderHistory.cartOrder');
      } else if (orderType === 'Prescription / Rx' || orderType === 'Prescription' || orderType === 'prescription') {
        return t('prescriptions.prescriptionRx');
      } else if (orderType === 'Prescription Order') {
        return t('orderHistory.prescriptionOrder');
      }
    }
    return orderType;
  }
  
  // Handle Prescription structure
  if (order.prescription_text) {
    return t ? t('prescriptions.prescriptionRx') : 'Prescription / Rx';
  }
  
  // Handle OrderHistoryItem structure
  if (order.request) {
    const request = order.request;
    if (t) {
      if (request === 'Cart Order') {
        return t('orderHistory.cartOrder');
      } else if (request === 'Prescription / Rx' || request === 'Prescription') {
        return t('prescriptions.prescriptionRx');
      } else if (request === 'Prescription Order') {
        return t('orderHistory.prescriptionOrder');
      }
    }
    return request;
  }
  
  return t ? t('common.notAvailable') : 'N/A';
}

/**
 * Get the status with translation
 */
function getOrderStatus(order: any, t?: (key: string) => string): string {
  const status = order.status;
  if (!t) return status;
  
  switch (status) {
    case 'pending':
      return t('orderHistory.pending');
    case 'processing':
      return t('orderHistory.processing');
    case 'shipping':
      return t('orderHistory.shipping');
    case 'delivered':
      return t('orderHistory.delivered');
    case 'canceled':
      return t('orderHistory.canceled');
    case 'pharmacy_offer':
      return t('orderHistory.pharmacyOffer');
    case 'order_placed':
      return t('orderHistory.orderPlaced');
    default:
      return status;
  }
}

/**
 * Get the order date from different order types
 */
function getOrderDate(order: any): string {
  // Handle DeliveryOrder structure
  if (order.created_at) {
    return order.created_at;
  }
  
  // Handle Prescription structure
  if (order.created_at) {
    return order.created_at;
  }
  
  // Handle OrderHistoryItem structure
  if (order.start_date) {
    return order.start_date;
  }
  
  return '';
}

/**
 * Convert an array of orders to CSV format with localized headers and content
 * @param orders The orders to convert to CSV
 * @param t Translation function
 * @returns string CSV content
 */
export function convertOrdersToCSV(orders: any[], t?: (key: string) => string) {
  if (!orders || orders.length === 0) {
    return null;
  }

  // CSV headers with translation
  const headers = [
    t ? t('orderHistory.id') : 'ID',
    t ? t('orderHistory.name') : 'Customer Name',
    t ? t('orderHistory.request') : 'Request Type',
    t ? t('orderHistory.status') : 'Status',
    t ? t('orderHistory.date') : 'Date'
  ];
  
  // Convert data to CSV rows with translations
  const rows = orders.map(order => [
    escapeCSV(order.id),
    escapeCSV(getOrderCustomerName(order)),
    escapeCSV(getOrderRequestType(order, t)),
    escapeCSV(getOrderStatus(order, t)),
    escapeCSV(getOrderDate(order) ? formatPrescriptionDate(getOrderDate(order), false, t) : '')
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
 * Convenience function to directly export order data to CSV with localization
 * 
 * @param orders All available orders
 * @param selectedIds Optional array of selected order IDs to filter
 * @param onlySelected Whether to export only selected orders
 * @param t Translation function
 * @returns void
 */
export function exportOrdersToCsv(
  orders: any[], 
  selectedIds: string[] = [], 
  onlySelected: boolean = false,
  t?: (key: string) => string
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
    
    const csvContent = convertOrdersToCSV(dataToExport, t);
    if (!csvContent) {
      console.error("Failed to generate CSV content");
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportType = onlySelected ? 'selected' : 'all';
    const filename = t 
      ? `${t('orderHistory.title')}-${t(`common.${exportType}`)}-${timestamp}.csv`
      : `order-history-${exportType}-${timestamp}.csv`;
    
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error("Error exporting orders to CSV:", error);
  }
} 