"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  User,
  Pagination,
  Selection,
} from "@heroui/react";
import { formatPrescriptionDate } from "@/helpers/prescriptions";
type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

export const columns: Column[] = [
  { name: "ID", uid: "id", sortable: true },
  { name: "Name", uid: "name", sortable: true },
  { name: "Request", uid: "request", sortable: true },
  { name: "Status", uid: "status", sortable: true },
  { name: "Date", uid: "date" },
];

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
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
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

const statusColorMap: Record<string, StatusColor> = {
  delivered: "success",
  pending: "warning",
  cancelled: "danger",
};

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "request", "status", "date"];

interface OrderHistoryTableProps {
  orders: Prescription.Prescription[] | Dashboard.OrderHistoryItem[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function OrderHistoryTable({ orders, onSelectionChange }: OrderHistoryTableProps) {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] =
    React.useState<{column: string; direction: "ascending" | "descending"}>({
      column: "date",
      direction: "descending",
    });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns as Set<string>).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredOrders = [...orders];

    if (hasSearchFilter) {
      filteredOrders = filteredOrders.filter((order) =>
        (order as Prescription.Prescription).patient.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter as Set<string>).length !== Object.keys(statusColorMap).length
    ) {
      filteredOrders = filteredOrders.filter((order) =>
        Array.from(statusFilter as Set<string>).includes((order as Prescription.Prescription).prescription_text || "")
      );
    }

    return filteredOrders;
  }, [orders, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Prescription.Prescription | Dashboard.OrderHistoryItem, b: Prescription.Prescription | Dashboard.OrderHistoryItem) => {
      const first = a.id;
      const second = b.id;
      
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((order: Prescription.Prescription | Dashboard.OrderHistoryItem, columnKey: string) => {
    switch (columnKey) {
      case "id":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{order.id.substring(0, 8)}...</p>
          </div>
        );
      case "name":
        return (
          <User
            // avatarProps={{ radius: "lg", src: order.patient.avatar || undefined }}
            description={(order as Prescription.Prescription).patient.name || ""}
            name={(order as Prescription.Prescription).patient.name || ""}
          >
            {(order as Prescription.Prescription).patient.name || ""}
          </User>
        );
      case "request":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">
              {order && typeof order === 'object' && 'prescription_text' in order ? "Prescription / Rx" : (order as Dashboard.OrderHistoryItem).request || "N/A"}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={"default"}
            size="sm"
            variant="flat"
          >
            {order.status}
          </Chip>
        );
      case "date":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{formatPrescriptionDate((order as Prescription.Prescription).created_at, false)}</p>
          </div>
        );
      default:
        return <></>;
    }
  }, []);

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
    return (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [page, pages]);

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
      aria-label="Order History Table"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      topContent={topContent}
      topContentPlacement="outside"
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
      <TableBody emptyContent={"No orders found"} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey as string)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
