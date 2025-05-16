"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  SortDescriptor,
  Selection,
} from "@heroui/react";

type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

type UserType = {
  id: number;
  name: string;
  request: string;
  status: string;
  date: string;
  avatar: string;
  email?: string;
  team?: string;
  [key: string]: any; // Index signature to allow string indexing
};

export const columns: Column[] = [
  { name: "ID", uid: "id", sortable: true },
  { name: "Name", uid: "name", sortable: true },
  { name: "Request", uid: "request", sortable: true },
  { name: "Status", uid: "status", sortable: true },
  { name: "Date", uid: "date" },
];

export const users: UserType[] = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "Client",
    request: "Tech Lead",
    status: "Development",
    date: "2025-01-01",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Client",
    request: "Tech Lead",
    status: "Development",
    date: "2025-01-01",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Client",
    request: "Tech Lead",
    status: "Development",
    date: "2025-01-01",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  },
  {
    id: 4,
    name: "William Howard",
    role: "Client",
    request: "Tech Lead",
    status: "Development",
    date: "2025-01-01",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Client",
    request: "Tech Lead",
    status: "Development",
    date: "2025-01-01",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
  },
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
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["id", "name", "request", "status", "date"];

const statusOptions = ["active", "paused", "vacation"];

type CustomSortDescriptor = {
  column: string;
  direction: "ascending" | "descending";
};

export default function App() {
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
    React.useState<CustomSortDescriptor>({
      column: "age",
      direction: "ascending",
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
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter as Set<string>).length !== statusOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter as Set<string>).includes(user.status)
      );
    }

    return filteredUsers;
  }, [users, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: UserType, b: UserType) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];

      // Handle potential undefined values
      if (first === undefined && second === undefined) return 0;
      if (first === undefined) return -1;
      if (second === undefined) return 1;

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((user: UserType, columnKey: string) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.role}
            name={cellValue as string}
          >
            {user.role}
          </User>
        );
      case "request":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">
              {cellValue as string}
            </p>
            <p className="text-bold text-tiny capitalize text-default-400">
              {user.team}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={(statusColorMap[user.status] || "default") as StatusColor}
            size="sm"
            variant="flat"
          >
            {cellValue as string}
          </Chip>
        );
      default:
        return cellValue as string;
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

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            item: "cursor-pointer",
          }}
        />
        <div className="flex gap-4 items-center w-max">
          <span className="w-max text-small text-default-400">
            {selectedKeys === "all"
              ? "All items selected"
              : `${(selectedKeys as Set<string>).size} of ${
                  filteredItems.length
                } selected`}
          </span>
          <div className="hidden sm:flex w-max justify-end gap-2">
            <Button
              isDisabled={pages === 1}
              size="sm"
              variant="flat"
              onPress={onPreviousPage}
            >
              Previous
            </Button>
            <Button
              isDisabled={pages === 1}
              size="sm"
              variant="flat"
              onPress={onNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages]);

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with custom cells, pagination and sorting"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px] shadow-none p-0",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor as unknown as SortDescriptor}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys as (keys: Selection) => void}
      onSortChange={setSortDescriptor as (descriptor: SortDescriptor) => void}
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
      <TableBody emptyContent={"No users found"} items={sortedItems}>
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
