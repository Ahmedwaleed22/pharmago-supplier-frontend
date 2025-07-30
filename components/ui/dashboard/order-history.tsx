import React, { useState, useRef, useEffect } from 'react'
import DashboardCard from './dashboard-card';
import OrderHistoryTable from './order-history-table';
import { Icon } from "@iconify/react";
import CustomButton from '@/components/custom-button';
import { exportOrdersToCsv } from '@/helpers/export';
import { useTranslation } from '@/contexts/i18n-context';

interface OrderHistoryProps {
  className?: string;
  noTitle?: boolean;
  orders: Prescription.Prescription[] | Dashboard.OrderHistoryItem[];
  onSelectionChange?: (selectedIds: string[]) => void;
  noPagination?: boolean;
  cardFooter?: React.ReactNode;
}

function OrderHistory({ noTitle, orders, onSelectionChange, noPagination, cardFooter = <></> }: OrderHistoryProps) {
  const { t } = useTranslation();
  
  // State to store selected order IDs
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  // State for custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update selectedOrderIds when selection changes
  const handleSelectionChange = (ids: string[]) => {
    setSelectedOrderIds(ids);
    // Pass selection up to parent if needed
    if (onSelectionChange) {
      onSelectionChange(ids);
    }
  };

  // Convert OrderHistoryItems to Prescription format if needed
  const convertToPrescriptionFormat = (
    data: (Prescription.Prescription | Dashboard.OrderHistoryItem)[]
  ): Prescription.Prescription[] => {
    return data.map(item => {
      // Check if it's already a Prescription
      if ('patient' in item && 'prescription_text' in item) {
        return item as Prescription.Prescription;
      }
      
      // It's an OrderHistoryItem, convert to Prescription format
      const orderItem = item as Dashboard.OrderHistoryItem;
      return {
        id: orderItem.id,
        name: orderItem.user?.name || 'Unknown',
        patient: {
          id: orderItem.user?.id || '',
          name: orderItem.user?.name || 'Unknown'
        },
        file_path: orderItem.file_path || null,
        prescription_text: orderItem.prescription_text || orderItem.request || null,
        created_at: orderItem.start_date,
        status: orderItem.status
      };
    });
  };

  // Export orders to CSV
  const handleExport = (onlySelected: boolean = false) => {
    if (!orders || orders.length === 0) {
      console.error("No orders available to export");
      return;
    }

    try {
      // Convert data to Prescription format if needed
      const prescriptions = convertToPrescriptionFormat(orders);
      
      if (onlySelected && selectedOrderIds.length > 0) {
        const selectedOrders = prescriptions.filter(order => 
          selectedOrderIds.includes(order.id)
        );
        
        if (selectedOrders.length === 0) {
          console.error("No selected orders found");
          return;
        }
        
        exportOrdersToCsv(selectedOrders, selectedOrderIds, true, t);
      } else {
        // Export all orders
        exportOrdersToCsv(prescriptions, [], false, t);
      }
      
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error preparing data for export:", error);
    }
  };

  return (
    <DashboardCard className="p-0">
      <div className="flex flex-col gap-3 p-6">
        <div className="flex justify-between items-center">
          {!noTitle && (
            <h3 className="text-[#414651] font-bold text-lg">{t('orderHistory.title')}</h3>
          )}
          
          <div className="relative ml-auto" ref={dropdownRef}>
            <CustomButton 
              className="bg-white text-blue-gray hover:bg-[#f8f8f8]"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Icon className="mr-1" icon="lucide:cloud-download" width="24" height="24"/>
              {t('common.download')}
            </CustomButton>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-10">
                <div role="menu" aria-orientation="vertical">
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-tr-md rounded-tl-md transition-all duration-100"
                    role="menuitem"
                    onClick={() => handleExport(false)}
                  >
                    {t('common.exportAll')}
                  </button>
                  <button
                    className={`w-full text-left px-4 py-3 text-sm rounded-br-md rounded-bl-md transition-all duration-100 ${selectedOrderIds.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}`}
                    role="menuitem"
                    onClick={() => selectedOrderIds.length > 0 && handleExport(true)}
                    disabled={selectedOrderIds.length === 0}
                  >
                    {t('common.exportSelected')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <OrderHistoryTable
          orders={orders} 
          onSelectionChange={handleSelectionChange}
          noPagination={noPagination}
        />
        {cardFooter}
      </div>
    </DashboardCard>
  )
}

export default OrderHistory;