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

export type ActiveIngredient = {
  id: string;
  name: string;
};

export const columns: ColumnDef<ActiveIngredient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ingredient Name
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
      const ingredient = row.original;

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
                href={`/dashboard/active-ingredients/edit?id=${ingredient.id}`}
              >
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-delete-ingredient", {
                    detail: ingredient,
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

export function ActiveIngredientsDatatable() {
  const [data, setData] = React.useState<ActiveIngredient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  React.useEffect(() => {
    // fetch list
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/active-ingredients`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setData(
            json.data.map((i: unknown) => {
              const rec = i as Record<string, unknown>;
              return {
                id: String(rec.id ?? rec.ingredient_id ?? ""),
                name: String(rec.ingredient_name ?? rec.name ?? ""),
              } as typeof rec & { id: string; name: string };
            })
          );
        }
      } catch (err) {
        console.error("Failed to fetch active ingredients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete dialog state and selected ingredient
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    React.useState<ActiveIngredient | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  // listen for delete requests (dispatched as a CustomEvent)
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ActiveIngredient;
      if (detail && detail.id) {
        setSelectedIngredient(detail);
        setDeleteError("");
        setDeleteDialogOpen(true);
      }
    };

    window.addEventListener("open-delete-ingredient", handler as EventListener);
    return () =>
      window.removeEventListener(
        "open-delete-ingredient",
        handler as EventListener
      );
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return setDeleteError("Missing ingredient id");
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/active-ingredients/${id}`,
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
        const resultObj = await response.json();
        if (response.ok && resultObj.success === true) {
          setData((prev) => prev.filter((p) => p.id !== id));
          setDeleteDialogOpen(false);
          setSelectedIngredient(null);
          toast.success("Ingredient deleted");
        } else {
          const err = resultObj.error || "Failed to delete ingredient";
          setDeleteError(err);
          toast.error(err);
        }
      } else {
        const text = await response.text();
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
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
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
          placeholder="Filter ingredient names..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="/dashboard/active-ingredients/create">
            Create Ingredient
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
      <ConfirmDelete
        open={deleteDialogOpen}
        setOpen={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setSelectedIngredient(null);
            setDeleteError("");
          }
        }}
        title="Delete ingredient"
        description={`Are you sure you want to delete ${
          selectedIngredient?.name ?? "this ingredient"
        }? This action cannot be undone.`}
        loading={deleting}
        error={deleteError}
        onConfirm={() => handleDelete(selectedIngredient?.id)}
      />
    </div>
  );
}
