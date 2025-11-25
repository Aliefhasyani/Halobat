"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export type Manufacturer = {
  id: string;
  name: string;
};

export const columns: ColumnDef<Manufacturer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Manufacturer Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const manufacturer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/manufacturers/edit?id=${manufacturer.id}`}
              >
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-delete-manufacturer", {
                    detail: manufacturer,
                  })
                )
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ManufacturersDatatable() {
  const [data, setData] = React.useState<Manufacturer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://halobat-production.up.railway.app/api/manufacturers"
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // normalize to {id,name}
          setData(
            result.data.map((m: unknown) => {
              const rec = m as Record<string, unknown>;
              return {
                id: String(rec.manufacturer_id ?? rec.id ?? ""),
                name: String(rec.manufacturer_name ?? rec.name ?? ""),
              } as { id: string; name: string };
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch manufacturers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete dialog state and selected manufacturer
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedManufacturer, setSelectedManufacturer] =
    React.useState<Manufacturer | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Manufacturer;
      if (detail && detail.id) {
        setSelectedManufacturer(detail);
        setDeleteError("");
        setDeleteDialogOpen(true);
      }
    };

    window.addEventListener(
      "open-delete-manufacturer",
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        "open-delete-manufacturer",
        handler as EventListener
      );
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return setDeleteError("Missing manufacturer id");

    setDeleting(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDeleteError("Not authenticated. Please login.");
        setDeleting(false);
        return;
      }

      const response = await fetch(
        `https://halobat-production.up.railway.app/api/manufacturers/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.status === 401) {
        setDeleteError("Unauthorized. Please login again.");
        setDeleting(false);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const resultObj = (await response.json()) as Record<string, unknown>;
        if (response.ok && resultObj && resultObj.success === true) {
          setData((prev) => prev.filter((m) => m.id !== id));
          setDeleteDialogOpen(false);
          setSelectedManufacturer(null);
        } else {
          console.error("Error deleting manufacturer:", resultObj);
          const errMsg =
            typeof resultObj.error === "string"
              ? resultObj.error
              : "Failed to delete manufacturer";
          setDeleteError(errMsg);
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setDeleteError(`Delete failed: ${text.slice(0, 200)}`);
      }
    } catch (err) {
      console.error(err);
      setDeleteError("An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-40" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter manufacturer names..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="/dashboard/manufacturers/create">
            Create Manufacturer
          </Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} row(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {/* Delete dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium">Delete manufacturer</h3>
            <p className="mt-2 text-sm">
              Are you sure you want to delete{" "}
              {selectedManufacturer?.name ?? "this manufacturer"}? This action
              cannot be undone.
            </p>
            {deleteError && <p className="text-red-500 mt-2">{deleteError}</p>}
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedManufacturer(null);
                  setDeleteError("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(selectedManufacturer?.id)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
