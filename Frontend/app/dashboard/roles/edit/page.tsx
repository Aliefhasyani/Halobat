"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";

type FormData = {
  name: string;
  description: string;
};

export default function EditRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const form = useForm<FormData>({
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (!id) {
      setFetching(false);
      setError("Missing id in query string");
      return;
    }

    // fetch role detail when id is present
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/roles/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          form.reset({
            name: json.data.name ?? "",
            description: json.data.description ?? "",
          });
        } else {
          setError(json.error || "Failed to load role");
        }
      })
      .catch(() => setError("An error occurred"))
      .finally(() => setFetching(false));
  }, [id, form]);

  const onSubmit = async (data: FormData) => {
    if (!id) return setError("Missing id");
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/roles/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) router.push("/dashboard/");
      else setError("Failed to update role");
    } catch {
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
              <CardTitle>Edit Role</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="h-8 w-full bg-muted-foreground rounded" />
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && <p className="text-red-500">{error}</p>}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Role"}
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
