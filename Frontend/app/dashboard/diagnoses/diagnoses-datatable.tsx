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
import ConfirmDelete from "@/components/custom/confirm-delete";
import { toast } from "sonner";
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

export type Diagnosis = {
  diagnosis_id: string;
  user_id: string;
  user: string | null;
  symptoms: string;
  diagnosis: string;
  created_at: string;
};

export const columns: ColumnDef<Diagnosis>[] = [
  {
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("user") || "N/A"}</div>,
  },
  {
    accessorKey: "symptoms",
    header: "Symptoms",
    cell: ({ row }) => (
      <div className="max-w-md truncate">{row.getValue("symptoms")}</div>
    ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
    cell: ({ row }) => (
      <div className="max-w-md truncate">{row.getValue("diagnosis")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const diagnosis = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("view-diagnosis", { detail: diagnosis })
                )
              }
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-delete-diagnosis", {
                    detail: diagnosis,
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

export function DiagnosesDatatable() {
  const [data, setData] = React.useState<Diagnosis[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/diagnoses`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Delete flow
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] =
    React.useState<Diagnosis | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  // View details dialog
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [viewDiagnosis, setViewDiagnosis] = React.useState<Diagnosis | null>(
    null
  );

  // listen for dispatched delete events
  React.useEffect(() => {
    const deleteHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Diagnosis;
      if (detail && detail.diagnosis_id) {
        setSelectedDiagnosis(detail);
        setDeleteError("");
        setDeleteDialogOpen(true);
      }
    };

    const viewHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Diagnosis;
      if (detail && detail.diagnosis_id) {
        setViewDiagnosis(detail);
        setViewDialogOpen(true);
      }
    };

    window.addEventListener(
      "open-delete-diagnosis",
      deleteHandler as EventListener
    );
    window.addEventListener("view-diagnosis", viewHandler as EventListener);
    return () => {
      window.removeEventListener(
        "open-delete-diagnosis",
        deleteHandler as EventListener
      );
      window.removeEventListener(
        "view-diagnosis",
        viewHandler as EventListener
      );
    };
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return setDeleteError("Missing diagnosis id");

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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/diagnoses/${id}`,
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
          setData((prev) => prev.filter((d) => d.diagnosis_id !== id));
          setDeleteDialogOpen(false);
          setSelectedDiagnosis(null);
          toast.success("Diagnosis deleted");
        } else {
          console.error("Error deleting diagnosis:", resultObj);
          const errMsg =
            typeof resultObj.error === "string"
              ? resultObj.error
              : "Failed to delete diagnosis";
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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
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
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
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
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
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
        title="Delete diagnosis"
        description={`Are you sure you want to delete this diagnosis? This action cannot be undone.`}
        loading={deleting}
        error={deleteError}
        onConfirm={() => handleDelete(selectedDiagnosis?.diagnosis_id)}
      />

      {/* View Details Dialog */}
      {viewDialogOpen && viewDiagnosis && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setViewDialogOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Diagnosis Details</h2>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">User:</label>
                <p>{viewDiagnosis.user || "N/A"}</p>
              </div>
              <div>
                <label className="font-semibold">Date:</label>
                <p>{new Date(viewDiagnosis.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="font-semibold">Symptoms:</label>
                <p className="whitespace-pre-wrap">{viewDiagnosis.symptoms}</p>
              </div>
              <div>
                <label className="font-semibold">Diagnosis:</label>
                <p className="whitespace-pre-wrap">{viewDiagnosis.diagnosis}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

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
