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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ConfirmDelete from "@/components/custom/confirm-delete";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export type Drug = {
  type: "generic" | "brand";
  id: string;
  name: string;
  description: string;
  picture: string | null;
  price: string;
  manufacturer_data?: {
    id: string;
    name: string;
  };
  dosage_form_data?: {
    id: string;
    name: string;
  };
  drug_id?: string;
  drug_data?: {
    drug_id: string;
    generic_name: string;
    description: string;
    price: string;
    picture: string | null;
  };
};

export const columns: ColumnDef<Drug>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <div>${row.getValue("price")}</div>,
  },
  {
    id: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => (
      <div>{row.original.manufacturer_data?.name || "N/A"}</div>
    ),
  },
  {
    id: "dosageForm",
    header: "Dosage Form",
    cell: ({ row }) => (
      <div>{row.original.dosage_form_data?.name || "N/A"}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const drug = row.original;

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
              <a
                href={
                  drug.type === "brand"
                    ? `/dashboard/brands/edit?id=${drug.id}`
                    : `/dashboard/drugs/edit?id=${drug.id}`
                }
              >
                Edit
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-delete-drug", { detail: drug })
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

export function DrugsDatatable() {
  const [data, setData] = React.useState<Drug[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  React.useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/drugs`
        );
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrugs();
  }, []);

  // Delete flow for drugs and branded drugs
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDrug, setSelectedDrug] = React.useState<Drug | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Drug;
      if (detail && detail.id) {
        setSelectedDrug(detail);
        setDeleteError("");
        setDeleteDialogOpen(true);
      }
    };

    window.addEventListener("open-delete-drug", handler as EventListener);
    return () =>
      window.removeEventListener("open-delete-drug", handler as EventListener);
  }, []);

  const handleDelete = async (id?: string, type?: string) => {
    if (!id) return setDeleteError("Missing drug/brand id");

    setDeleting(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const msg = "Not authenticated. Please login.";
        setDeleteError(msg);
        toast.error(msg);
        setDeleting(false);
        return;
      }

      const route = type === "brand" ? `/api/brands/${id}` : `/api/drugs/${id}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}${route}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.status === 401) {
        const msg = "Unauthorized. Please login again.";
        setDeleteError(msg);
        toast.error(msg);
        setDeleting(false);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const resultObj = (await response.json()) as Record<string, unknown>;
        if (response.ok && resultObj && resultObj.success === true) {
          setData((prev) => prev.filter((d) => d.id !== id));
          setDeleteDialogOpen(false);
          setSelectedDrug(null);
          const msg = type === "brand" ? "Brand deleted" : "Drug deleted";
          toast.success(msg);
        } else {
          console.error("Error deleting item:", resultObj);
          const errMsg =
            typeof resultObj.error === "string"
              ? resultObj.error
              : "Failed to delete item";
          setDeleteError(errMsg);
          toast.error(errMsg);
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setDeleteError(`Delete failed: ${text.slice(0, 200)}`);
      }
    } catch (err) {
      console.error(err);
      const msg = "An error occurred";
      setDeleteError(msg);
      toast.error(msg);
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
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
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
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
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
      <div className="flex items-center py-4">
        <div className="flex-1">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="ml-4">
          <Button asChild>
            <a href="/dashboard/drugs/create">Create Drug</a>
          </Button>
          <Button asChild>
            <a href="/dashboard/brands/create">Create Branded Drug</a>
          </Button>
        </div>
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
      <ConfirmDelete
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title="Delete product"
        description={`Are you sure you want to delete ${
          selectedDrug?.name ?? "this item"
        }? This is permanent.`}
        loading={deleting}
        error={deleteError}
        onConfirm={() => handleDelete(selectedDrug?.id, selectedDrug?.type)}
      />

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
    </div>
  );
}
