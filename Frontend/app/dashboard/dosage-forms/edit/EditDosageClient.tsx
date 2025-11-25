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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

type FormData = {
  name: string;
};

export default function EditDosageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const form = useForm<FormData>({ defaultValues: { name: "" } });
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!id) {
      setFetching(false);
      setError("Missing dosage id in query string.");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`https://halobat-production.up.railway.app/api/dosage-forms/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          form.reset({ name: json.data.dosage_name ?? json.data.name ?? "" });
          loadedRef.current = true;
        } else {
          setError(json.error || "Failed to load dosage");
        }
      })
      .catch((e) => {
        console.error(e);
        setError("An error occurred while fetching dosage");
      })
      .finally(() => setFetching(false));
  }, [id, form]);

  const onSubmit = async (data: FormData) => {
    if (!id) return setError("Missing dosage id");

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
        `https://halobat-production.up.railway.app/api/dosage-forms/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ name: data.name }),
        }
      );

      const result = await response.json();
      if (response.ok && result.success) {
        router.push("/dashboard/");
      } else {
        console.error("Error updating dosage:", result);
        setError(result.error || "Failed to update dosage");
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
              <CardTitle>Edit Dosage</CardTitle>
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

                  {error && <p className="text-red-500">{error}</p>}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Dosage"}
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
