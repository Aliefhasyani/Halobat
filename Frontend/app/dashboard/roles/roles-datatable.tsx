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
import Link from "next/link";

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

export type Role = {
  role_id: string;
  name: string;
  description: string;
};

export const columns: ColumnDef<Role>[] = [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const role = row.original;

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
              <Link href={`/dashboard/roles/edit?id=${role.role_id}`}>
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-delete-role", { detail: role })
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

export function RolesDatatable() {
  const [data, setData] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/roles`)
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
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  // listen for dispatched delete events
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Role;
      if (detail && detail.role_id) {
        setSelectedRole(detail);
        setDeleteError("");
        setDeleteDialogOpen(true);
      }
    };

    window.addEventListener("open-delete-role", handler as EventListener);
    return () =>
      window.removeEventListener("open-delete-role", handler as EventListener);
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return setDeleteError("Missing role id");

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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/roles/${id}`,
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
          setData((prev) => prev.filter((r) => r.role_id !== id));
          setDeleteDialogOpen(false);
          setSelectedRole(null);
          toast.success("Role deleted");
        } else {
          console.error("Error deleting role:", resultObj);
          const errMsg =
            typeof resultObj.error === "string"
              ? resultObj.error
              : "Failed to delete role";
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
        <Button asChild>
          <Link href="/dashboard/roles/create">Create Role</Link>
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
      <ConfirmDelete
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title="Delete role"
        description={`Are you sure you want to delete ${
          selectedRole?.name ?? "this role"
        }? This action cannot be undone.`}
        loading={deleting}
        error={deleteError}
        onConfirm={() => handleDelete(selectedRole?.role_id)}
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
