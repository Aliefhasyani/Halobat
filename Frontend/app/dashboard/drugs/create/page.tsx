"use client";

import { useEffect, useState } from "react";
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
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadClear,
} from "@/components/ui/file-upload";
import { useDirectUpload } from "@/components/ui/file-upload-direct";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UploadCloud } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = {
  generic_name: string;
  description?: string;
  picture?: string;
  // price is stored as string in the form to keep the input controlled (empty string when unset)
  price?: string | number;
  manufacturer_id?: string;
  dosage_form_id?: string;
};

export default function CreateDrugPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [manufacturers, setManufacturers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [dosages, setDosages] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [ingredients, setIngredients] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null
  );
  const [selectedIngredientQty, setSelectedIngredientQty] = useState<number>(0);
  const [activeIngredientsList, setActiveIngredientsList] = useState<
    Array<{ id: string; quantity: number }>
  >([]);

  const form = useForm<FormData>({
    defaultValues: {
      generic_name: "",
      description: "",
      picture: "",
      price: "",
      manufacturer_id: "",
      dosage_form_id: "",
    },
  });

  useEffect(() => {
    // fetch manufacturers, dosage forms, and ingredients
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manufacturers`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          // filter out empty ids and dedupe by id
          const seen = new Set<string>();
          setManufacturers(
            json.data
              .map((m: Record<string, unknown>) => ({
                id: String(m.manufacturer_id ?? m.id ?? ""),
                name: String(m.manufacturer_name ?? m.name ?? ""),
              }))
              .filter(
                (it: { id: string; name: string }) =>
                  !!it.id && !seen.has(it.id) && (seen.add(it.id), true)
              )
          );
        }
      })
      .catch(() => {});

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dosage-forms`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const seenD = new Set<string>();
          setDosages(
            json.data
              .map((d: Record<string, unknown>) => ({
                id: String(d.id ?? d.dosage_form_id ?? d.dosage_id ?? ""),
                name: String(
                  d.name ?? d.dosage_form_name ?? d.dosage_name ?? ""
                ),
              }))
              .filter(
                (it: { id: string; name: string }) =>
                  !!it.id && !seenD.has(it.id) && (seenD.add(it.id), true)
              )
          );
        }
      })
      .catch(() => {});

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/active-ingredients`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const seenI = new Set<string>();
          setIngredients(
            json.data
              .map((a: Record<string, unknown>) => ({
                id: String(a.id ?? a.active_ingredient_id ?? ""),
                name: String(
                  a.active_ingredient_name ??
                    a.ingredient_name ??
                    a.name ??
                    a.active_ingredient ??
                    ""
                ),
              }))
              .filter(
                (it: { id: string; name: string }) =>
                  !!it.id && !seenI.has(it.id) && (seenI.add(it.id), true)
              )
          );
        }
      })
      .catch(() => {});
  }, []);

  const addIngredient = () => {
    if (!selectedIngredient) return;
    if (!selectedIngredientQty || selectedIngredientQty <= 0)
      return setError("Quantity must be a positive number");

    setActiveIngredientsList((prev) => [
      ...prev.filter((p) => p.id !== selectedIngredient),
      { id: selectedIngredient, quantity: selectedIngredientQty },
    ]);

    // clear selections
    setSelectedIngredient(null);
    setSelectedIngredientQty(0);
    setError("");
  };

  const removeIngredient = (id: string) => {
    setActiveIngredientsList((prev) => prev.filter((p) => p.id !== id));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      const payload: Record<string, unknown> = {
        generic_name: data.generic_name,
        description: data.description,
        // only include picture when it's a non-empty string to avoid failing
        // backend `url` validation when an empty string is sent
        ...(data.picture && data.picture !== ""
          ? { picture: data.picture }
          : {}),
        // ensure price is a number if provided (empty string means not provided)
        ...(data.price !== "" && data.price !== undefined
          ? { price: Number(data.price) }
          : {}),
        manufacturer_id: data.manufacturer_id || undefined,
        dosage_form_id: data.dosage_form_id || undefined,
      };

      if (activeIngredientsList.length > 0)
        (payload as Record<string, unknown>)["active_ingredients"] =
          activeIngredientsList;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/drugs`,
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
          setError(result.error || "Failed to create drug");
        }
      } else {
        // non-JSON response (server returned HTML page or plain text)
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

  // Centralized upload handler — sets the `picture` form field with returned URL
  const onUpload = useDirectUpload((file, url) => {
    // react-hook-form setValue ensures the form data is populated with the returned URL
    form.setValue("picture", String(url));
  });

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <BubbleBackground className="absolute inset-0 pointer-events-none bg-primary" />

      <div className="relative z-10 w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Create Drug</CardTitle>
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
                  name="generic_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generic Name</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="picture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Picture</FormLabel>
                        <FormControl>
                          <div>
                            <FileUpload
                              accept="image/*"
                              maxSize={2 * 1024 * 1024} // 2MB match backend
                              multiple={false}
                              onUpload={onUpload}
                            >
                              <div className="space-y-2">
                                <FileUploadDropzone className="border rounded p-4">
                                  <div className="flex flex-col items-center gap-1 text-center w-full">
                                    <div className="flex items-center justify-center rounded-full border p-2.5">
                                      <UploadCloud className="h-6 w-6 text-muted-foreground" />
                                    </div>

                                    <p className="font-medium text-sm">
                                      Drag & drop files here
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Or click to browse
                                    </p>

                                    <div className="mt-2 flex items-center gap-2 justify-center">
                                      <FileUploadTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          Browse files
                                        </Button>
                                      </FileUploadTrigger>
                                      <FileUploadClear className="btn-ghost" />
                                    </div>
                                  </div>
                                  {field.value && (
                                    <div className="mt-2 flex items-center justify-center gap-3">
                                      <Image
                                        src={String(field.value)}
                                        alt="uploaded"
                                        width={72}
                                        height={72}
                                        className="rounded object-cover border"
                                      />
                                    </div>
                                  )}
                                </FileUploadDropzone>
                                <FileUploadList />
                              </div>
                            </FileUpload>

                            {/* no external preview — preview is rendered inside the FileUpload area */}
                          </div>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) => field.onChange(v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select manufacturer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {manufacturers.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name}
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

                  <FormField
                    control={form.control}
                    name="dosage_form_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage form</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) => field.onChange(v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select dosage form" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {dosages.map((d) => (
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
                </div>

                {/* Active ingredients block */}
                <div className="border rounded p-4">
                  <div className="flex flex-col md:flex-row md:items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Active Ingredient
                      </label>
                      <Select
                        value={selectedIngredient ?? ""}
                        onValueChange={(v) => setSelectedIngredient(v || null)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {ingredients.map((ing) => (
                              <SelectItem key={ing.id} value={ing.id}>
                                {ing.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-36">
                      <label className="block text-sm font-medium mb-1">
                        Quantity (mg)
                      </label>
                      <Input
                        value={selectedIngredientQty || ""}
                        onChange={(e) =>
                          setSelectedIngredientQty(Number(e.target.value))
                        }
                        type="number"
                      />
                    </div>

                    <div>
                      <Button type="button" onClick={addIngredient}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {activeIngredientsList.length > 0 && (
                    <div className="mt-4">
                      <div className="space-y-2">
                        {activeIngredientsList.map((a, idx) => (
                          <div
                            key={`${a.id}-${idx}`}
                            className="flex items-center justify-between space-x-4 border rounded px-2 py-1"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {ingredients.find((i) => i.id === a.id)?.name ??
                                  a.id}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Quantity: {a.quantity} mg
                              </div>
                            </div>
                            <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIngredient(a.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {error && <p className="text-red-500">{error}</p>}
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Drug"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
