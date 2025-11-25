"use client";

import React, { useEffect, useState, useRef } from "react";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type FormData = {
  full_name: string;
  username: string;
  email: string;
  password: string;
  role_id?: string;
};

export default function EditUserClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const userLoadedRef = useRef(false);
  const userRoleNameRef = useRef<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: { full_name: "", username: "", email: "", password: "" },
  });

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const viewer_id =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

    if (viewer_id) {
      fetch(
        `https://halobat-production.up.railway.app/api/users/${viewer_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data)
            setIsSuperadmin(json.data.role === "superadmin");
        })
        .catch(() => {});
    }

    fetch("https://halobat-production.up.railway.app/api/roles")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRoles(
            json.data.map(
              (r: {
                id?: number | string;
                role_id?: number | string;
                roleId?: number | string;
                name?: string;
              }) => ({
                id: String(r.id ?? r.role_id ?? r.roleId ?? ""),
                name: String(r.name ?? ""),
              })
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) {
      setFetching(false);
      setError("Missing user id in query string.");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`https://halobat-production.up.railway.app/api/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const userRoleName = json.data.role || null;
          userRoleNameRef.current = userRoleName;
          form.reset({
            full_name: json.data.full_name || "",
            username: json.data.username || "",
            email: json.data.email || "",
            password: "",
          });
          userLoadedRef.current = true;
        } else {
          setError(json.error || "Failed to load user");
        }
      })
      .catch((e) => {
        console.error(e);
        setError("An error occurred while fetching user");
      })
      .finally(() => setFetching(false));
  }, [id, form]);

  useEffect(() => {
    if (!userLoadedRef.current) return;
    if (!userRoleNameRef.current) return;
    if (!roles || roles.length === 0) return;

    const currentRoleId = form.getValues("role_id");
    if (currentRoleId) return;

    const matchedRole = roles.find((r) => r.name === userRoleNameRef.current);
    if (matchedRole) form.setValue("role_id", matchedRole.id);
  }, [roles, form]);

  const onSubmit = async (data: FormData) => {
    if (!id) return setError("Missing user id");

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://halobat-production.up.railway.app/api/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        }
      );

      if (response.status === 401) {
        setError("Unauthorized. Please login again.");
        setLoading(false);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const resultObj = (await response.json()) as Record<string, unknown>;
        if (response.ok && resultObj && resultObj.success === true)
          router.push("/dashboard/");
        else {
          console.error("Error updating user:", resultObj);
          const errMsg =
            typeof resultObj.error === "string"
              ? resultObj.error
              : "Failed to update user";
          setError(errMsg);
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setError(`Update failed: ${text.slice(0, 200)}`);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <BubbleBackground className="absolute inset-0 pointer-events-none bg-primary" />

      <div className="relative z-10 w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Edit User</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* form fields same as before, omitted here for readability (kept in full source) */}
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isSuperadmin && (
                    <FormField
                      control={form.control}
                      name="role_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? ""}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Roles</SelectLabel>
                                  {roles.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>
                                      {r.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {error && <p className="text-red-500">{error}</p>}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update User"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
