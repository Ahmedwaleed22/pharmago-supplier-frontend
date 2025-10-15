"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
} from "@heroui/react";
import { formatPrescriptionDate } from "@/helpers/prescriptions";
import { useTranslation } from "@/contexts/i18n-context";
import { useRouter } from "next/navigation";

type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

interface IconProps {
  size?: number;
  width?: number | string;
  height?: number | string;
  [key: string]: any;
}

export const VerticalDotsIcon = ({
  size = 24,
  width: widthProp,
  height: heightProp,
  ...props
}: IconProps) => {
  const width = widthProp || size;
  const height = heightProp || size;

  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={height}
      role="presentation"
      viewBox="0 0 24 24"
      width={width}
      {...props}
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

type StatusColor =
  | "success"
  | "danger"
  | "warning"
  | "default"
  | "primary"
  | "secondary";

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "request", "status", "date"];

interface OrderHistoryTableProps {
  orders: Prescription.Prescription[] | Dashboard.OrderHistoryItem[] | Dashboard.DeliveryOrder[];
  onSelectionChange?: (selectedIds: string[]) => void;
  noPagination?: boolean;
  context?: 'sales' | 'prescriptions' | 'delivery';
}

export default function OrderHistoryTable({ orders, onSelectionChange, noPagination, context = 'sales' }: OrderHistoryTableProps) {
  const { t, isRtl } = useTranslation();
  const router = useRouter();
  
  // Safety check for orders
  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="flex items-center justify-center h-32 text-foreground-400">
        No orders available
      </div>
    );
  }
  
  const columns: Column[] = [
    { name: t('orderHistory.id'), uid: "id", sortable: true },
    { name: t('orderHistory.name'), uid: "name", sortable: true },
    { name: t('orderHistory.request'), uid: "request", sortable: true },
    { name: t('orderHistory.status'), uid: "status", sortable: false },
    { name: t('orderHistory.date'), uid: "date", sortable: true },
  ];

  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  // Helper function to safely get the name from either data type
  const getOrderName = (order: Prescription.Prescription | Dashboard.OrderHistoryItem | Dashboard.DeliveryOrder): string => {
    if ('patient' in order) {
      return (order as Prescription.Prescription).patient?.name || "";
    } else if ('user' in order && order.user) {
      return order.user.name || "";
    }
    return "";
  };

  // Helper function to safely get the date from either data type
  const getOrderDate = (order: Prescription.Prescription | Dashboard.OrderHistoryItem | Dashboard.DeliveryOrder): string => {
    if ('patient' in order) {
      return (order as Prescription.Prescription).created_at;
    } else if ('start_date' in order) {
      return (order as Dashboard.OrderHistoryItem).start_date;
    } else if ('created_at' in order) {
      return (order as Dashboard.DeliveryOrder).created_at;
    }
    return "";
  };

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns as Set<string>).includes(column.uid)
    );
  }, [visibleColumns, columns]);

  const filteredItems = React.useMemo(() => {
    let filteredOrders = [...orders];

    if (hasSearchFilter) {
      filteredOrders = filteredOrders.filter((order) => {
        const name = getOrderName(order);
        return name.toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter as Set<string>).length !== Object.keys(statusColorMap).length
    ) {
      filteredOrders = filteredOrders.filter((order) => {
        const text = 'prescription_text' in order 
          ? (order as Prescription.Prescription).prescription_text || ""
          : 'request' in order
          ? (order as Dashboard.OrderHistoryItem).request || ""
          : 'order_type' in order
          ? (order as Dashboard.DeliveryOrder).order_type || ""
          : "";
        return Array.from(statusFilter as Set<string>).includes(text);
      });
    }

    return filteredOrders;
  }, [orders, filterValue, statusFilter]);

  const pages = React.useMemo(() => {
    return noPagination ? 1 : Math.ceil(filteredItems.length / rowsPerPage);
  }, [filteredItems.length, rowsPerPage, noPagination]);

  const items = React.useMemo(() => {
    if (noPagination) {
      return filteredItems;
    }
    
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage, noPagination]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Prescription.Prescription | Dashboard.OrderHistoryItem | Dashboard.DeliveryOrder, b: Prescription.Prescription | Dashboard.OrderHistoryItem | Dashboard.DeliveryOrder) => {
      const first = a.id;
      const second = b.id;
      
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((order: Prescription.Prescription | Dashboard.OrderHistoryItem | Dashboard.DeliveryOrder, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{order && typeof order === 'object' && 'tracking_id' in order ? order.tracking_id.substring(0, 8) + '...' : order.id.substring(0, 8) + '...'}</p>
          </div>
        );
      case "name":
        return (
          <User
            // avatarProps={{ radius: "lg", src: order.patient.avatar || undefined }}
            description={getOrderName(order)}
            name={getOrderName(order)}
          >
            {getOrderName(order)}
          </User>
        );
      case "request":
        const getRequestTranslation = (request: string) => {
          if (request === 'Cart Order') {
            return t('orderHistory.cartOrder');
          } else if (request === 'Prescription / Rx' || request === 'Prescription') {
            return t('prescriptions.prescriptionRx');
          } else if (request === 'Prescription Order') {
            return t('orderHistory.prescriptionOrder');
          }
          return request || "N/A";
        };
        
        // Handle different order types
        const getRequestText = (order: Prescription.Prescription | Dashboard.OrderHistoryItem | Dashboard.DeliveryOrder): string => {
          if ('type' in order && order.type === 'prescription') {
            return 'Prescription';
          } else if ('prescription_text' in order) {
            return 'Prescription';
          } else if ('request' in order) {
            return (order as Dashboard.OrderHistoryItem).request;
          } else if ('order_type' in order) {
            return (order as Dashboard.DeliveryOrder).order_type;
          }
          return 'Cart Order';
        };
        
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">
              {getRequestTranslation(getRequestText(order))}
            </p>
          </div>
        );
      case "status":
        const getStatusTranslation = (status: string) => {
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
            case 'supplier_offer':
              return t('orderHistory.supplierOffer');
            case 'order_placed':
              return t('orderHistory.orderPlaced');
            default:
              return status;
          }
        };
        
        return (
          <Chip
            className="capitalize"
            color={"default"}
            size="sm"
            variant="flat"
          >
            {getStatusTranslation(order.status)}
          </Chip>
        );
      case "date":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">
              {formatPrescriptionDate(getOrderDate(order), false, t)}
            </p>
          </div>
        );
      default:
        return <></>;
    }
  }, [t]);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return null;
  }, []);

  const bottomContent = React.useMemo(() => {
    if (noPagination) {
      return null;
    }
    
    return (
      <div className="flex w-full justify-center">
        <div className="ltr-force">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
            classNames={{
              cursor: "!hidden",
              item: "relative z-0",
              prev: "relative z-0 bg-default-100",
              next: "relative z-0 bg-default-100",
            }}
          />
        </div>
        <style jsx global>{`
          .ltr-force {
            direction: ltr !important;
          }
          .ltr-force * {
            direction: ltr !important;
          }
          .ltr-force [data-slot="wrapper"] {
            flex-direction: row !important;
          }
          .ltr-force [data-slot="cursor"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          .ltr-force [data-slot="item"][data-active="true"] {
            background-color: #3b82f6 !important; /* primary blue */
            color: white !important;
            box-shadow: var(--heroui-shadow-small) !important;
          }
          .ltr-force [data-slot="prev"] {
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: var(--heroui-radius-medium) !important;
            border-bottom-left-radius: var(--heroui-radius-medium) !important;
          }
          .ltr-force [data-slot="next"] {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
            border-top-right-radius: var(--heroui-radius-medium) !important;
            border-bottom-right-radius: var(--heroui-radius-medium) !important;
          }
          .ltr-force [data-slot="item"]:first-of-type {
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
          }
          .ltr-force [data-slot="item"]:last-of-type {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
          .ltr-force [data-slot="item"]:not(:first-of-type):not(:last-of-type) {
            border-radius: 0 !important;
          }
        `}</style>
      </div>
    );
  }, [page, pages, noPagination]);

  // Handle selection changes
  const handleSelectionChange = (keys: Selection) => {
    setSelectedKeys(keys);
    
    // If onSelectionChange callback is provided, pass selected IDs
    if (onSelectionChange) {
      const selectedIds = Array.from(keys)
        .filter((key): key is string => typeof key === 'string')
        .map((key) => key);
      
      console.log("Selected IDs:", selectedIds);
      onSelectionChange(selectedIds);
    }
  };

  return (
    <Table
      aria-label="Example table with custom cells, pagination and sorting"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={handleSelectionChange}
      onSortChange={(descriptor) => setSortDescriptor({
        column: String(descriptor.column),
        direction: descriptor.direction as "ascending" | "descending"
      })}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={t('common.noData')} items={sortedItems}>
        {(item) => {
          // Determine the order type and route accordingly based on context
          const getOrderRoute = (order: Prescription.Prescription | Dashboard.OrderHistoryItem | Dashboard.DeliveryOrder): string => {
            // Handle prescriptions context
            if (context === 'prescriptions') {
              return `/dashboard/prescriptions/requests/${order.id}`;
            }
            
            // Handle delivery context - same as sales
            if (context === 'delivery') {
              // Check if it's a cart order
              if ('request' in order) {
                const requestType = (order as Dashboard.OrderHistoryItem).request;
                if (requestType === 'Cart Order' || requestType === 'cart') {
                  return `/dashboard/orders/${order.id}`;
                }
                // Check if it's a prescription order from offer
                if (requestType === 'Prescription Order' || requestType === 'Prescription / Rx' || requestType === 'Prescription') {
                  return `/dashboard/orders/prescription/${order.id}`;
                }
              }
              
              // Check if it's a prescription by type or properties
              if ('type' in order && order.type === 'prescription') {
                return `/dashboard/orders/prescription/${order.id}`;
              }
              if ('prescription_text' in order || 'patient' in order) {
                return `/dashboard/orders/prescription/${order.id}`;
              }
              
              // Default to cart order route
              return `/dashboard/orders/${order.id}`;
            }
            
            // Handle sales context (default)
            if (context === 'sales') {
              // Check if it's a cart order
              if ('request' in order) {
                const requestType = (order as Dashboard.OrderHistoryItem).request;
                if (requestType === 'Cart Order' || requestType === 'cart') {
                  return `/dashboard/orders/${order.id}`;
                }
                // Check if it's a prescription order from offer
                if (requestType === 'Prescription Order' || requestType === 'Prescription / Rx' || requestType === 'Prescription') {
                  return `/dashboard/orders/prescription/${order.id}`;
                }
              }
              
              // Check if it's a prescription by type or properties
              if ('type' in order && order.type === 'prescription') {
                return `/dashboard/orders/prescription/${order.id}`;
              }
              if ('prescription_text' in order || 'patient' in order) {
                return `/dashboard/orders/prescription/${order.id}`;
              }
              
              // Default to cart order route
              return `/dashboard/orders/${order.id}`;
            }
            
            // Default fallback
            return `/dashboard/orders/${order.id}`;
          };

          return (
            <TableRow 
              key={item.id}
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => router.push(getOrderRoute(item))}
            >
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey as string)}</TableCell>
              )}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
