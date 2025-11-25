"use client";

import React, { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type FormData = {
  name: string;
  picture?: string;
  price?: string | number;
  drug_id?: string;
};

export default function EditBrandClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [drugs, setDrugs] = useState<Array<{ id: string; name: string }>>([]);

  const form = useForm<FormData>({
    defaultValues: { name: "", picture: "", price: "", drug_id: "" },
  });

  useEffect(() => {
    type DrugApi = {
      drug_id?: string | number;
      id?: string | number;
      generic_name?: string;
      name?: string;
      drug_data?: { generic_name?: string };
      generic?: string;
    };
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/drugs`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const seen = new Set<string>();
          setDrugs(
            json.data
              .map((d: DrugApi) => ({
                id: String(d.drug_id ?? d.id ?? d.drug_id ?? ""),
                name: String(
                  d.generic_name ??
                    d.name ??
                    d.drug_data?.generic_name ??
                    d.generic ??
                    ""
                ),
              }))
              .filter(
                (it: { id: string; name: string }) =>
                  !!it.id && !seen.has(it.id) && (seen.add(it.id), true)
              )
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) {
      setFetching(false);
      setError("Missing id in query string");
      return;
    }
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setFetching(true);
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/brands/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          form.reset({
            name: d.brand_name ?? d.name ?? "",
            picture: d.picture ?? "",
            price: d.price ?? "",
            drug_id:
              String(d.drug_id ?? d.drug?.drug_id ?? d.drug_id ?? "") ?? "",
          });
        } else setError(json.error || "Failed to load brand");
      })
      .catch((e) => {
        console.error(e);
        setError("An error occurred while fetching brand");
      })
      .finally(() => setFetching(false));
  }, [id, form]);

  const onSubmit = async (data: FormData) => {
    if (!id) return setError("Missing id");
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login.");
        setLoading(false);
        return;
      }
      const payload: Record<string, unknown> = {
        name: data.name,
        picture: data.picture,
        ...(data.price !== "" && data.price !== undefined
          ? { price: Number(data.price) }
          : {}),
        drug_id: data.drug_id || undefined,
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/brands/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.status === 401) {
        setError("Unauthorized. Please login again.");
        setLoading(false);
        return;
      }
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const resultObj = await response.json();
        if (response.ok && resultObj && resultObj.success === true)
          router.push("/dashboard/");
        else {
          const msg =
            typeof resultObj.error === "string"
              ? resultObj.error
              : "Failed to update brand";
          setError(msg);
        }
      } else {
        const text = await response.text();
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
              <CardTitle>Edit Brand</CardTitle>
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="picture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Picture URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drug_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Drug (generic)</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) => field.onChange(v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select drug" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {drugs.map((d) => (
                                  <SelectItem key={d.id} value={d.id}>
                                    {d.name}
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
                  {error && <p className="text-red-500">{error}</p>}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Brand"}
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
