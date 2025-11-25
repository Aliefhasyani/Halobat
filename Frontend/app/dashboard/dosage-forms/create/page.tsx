"use client";

import { useState } from "react";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import { useRouter } from "next/navigation";
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

type FormData = {
  name: string;
};

export default function CreateDosagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormData>({ defaultValues: { name: "" } });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://halobat-production.up.railway.app/api/dosage-forms",
        {
          method: "POST",
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
        setError(result.error || "Failed to create dosage");
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
              <CardTitle>Create Dosage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
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
                  {loading ? "Creating..." : "Create Dosage"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
