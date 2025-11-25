"use client";

import { useEffect, useState } from "react";
import { BubbleBackground } from "@/components/ui/shadcn-io/bubble-background";
import FileUploader from "@/components/ui/file-uploader";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = {
  name: string;
  picture?: string;
  price?: string | number;
  drug_id?: string;
};

export default function CreateBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [drugs, setDrugs] = useState<Array<{ id: string; name: string }>>([]);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      picture: "",
      price: "",
      drug_id: "",
    },
  });

  // FileUploader handles file selection & upload progress; local file state is no longer required

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
          // filter out empty ids and dedupe
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

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const payload: Record<string, unknown> = {
        name: data.name,
        picture: data.picture,
        ...(data.price !== "" && data.price !== undefined
          ? { price: Number(data.price) }
          : {}),
        drug_id: data.drug_id || undefined,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/brands`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        setError("Unauthorized. Please login again.");
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const result = await response.json();
        if (response.ok && result.success) {
          router.push("/dashboard/");
        } else {
          setError(result.error || "Failed to create brand");
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response from server:", text);
        setError(`Server error: ${text.slice(0, 200)}`);
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
              <CardTitle>Create Branded Drug</CardTitle>
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

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="picture"
                    render={({ field }) => (
                      <FormItem>
                        <FileUploader
                          initialUrl={form.getValues("picture") ?? null}
                          onUploaded={(url) => form.setValue("picture", url)}
                        />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mt-1">
                        You can also paste an image URL above.
                      </div>
                    </div>

                    <div className="w-20 h-20 border rounded overflow-hidden bg-white flex items-center justify-center">
                      {form.getValues("picture") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={String(form.getValues("picture"))}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground p-2">
                          No image
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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
                  {loading ? "Creating..." : "Create Brand"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
