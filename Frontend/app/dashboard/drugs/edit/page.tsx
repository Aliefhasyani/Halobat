"use client";

import { useEffect, useState, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  generic_name: string;
  description?: string;
  picture?: string;
  price?: string | number;
  manufacturer_id?: string;
  dosage_form_id?: string;
};

// shape returned by the API for active ingredient entries
type ActiveIngredientAPI = {
  id?: string;
  active_ingredient_id?: string;
  active_ingredient?: string;
  quantity?: number;
  qty?: number;
  pivot?: { quantity?: number };
};

export default function EditDrugPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  const drugLoadedRef = useRef(false);

  useEffect(() => {
    // allowed helpers: manufacturers, dosage forms, active ingredients
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/manufacturers`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
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

  useEffect(() => {
    if (!id) {
      setFetching(false);
      setError("Missing id in query string");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    setFetching(true);
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/drugs/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          // fill form
          const d = json.data;
          form.reset({
            generic_name: d.generic_name ?? d.name ?? "",
            description: d.description ?? "",
            picture: d.picture ?? "",
            price: d.price ?? "",
            manufacturer_id:
              String(
                (d.manufacturer_data && d.manufacturer_data.id) ??
                  d.manufacturer_id ??
                  d.manufacturer ??
                  ""
              ) ?? "",
            dosage_form_id:
              String(
                (d.dosage_form_data && d.dosage_form_data.id) ??
                  d.dosage_form_id ??
                  d.dosage_form ??
                  ""
              ) ?? "",
          });

          // active ingredients may come as array of {id, quantity}
          if (Array.isArray(d.active_ingredients)) {
            setActiveIngredientsList(
              d.active_ingredients.map((a: ActiveIngredientAPI) => ({
                id: String(
                  a.id ?? a.active_ingredient_id ?? a.active_ingredient ?? ""
                ),
                // quantity may be returned as `quantity`, `qty`, or inside `pivot.quantity`
                quantity: Number(
                  (a.quantity ??
                    a.qty ??
                    (a.pivot && a.pivot.quantity) ??
                    0) as number
                ),
              }))
            );
          }

          drugLoadedRef.current = true;
        } else {
          setError(json.error || "Failed to load drug");
        }
      })
      .catch((e) => {
        console.error(e);
        setError("An error occurred while fetching drug");
      })
      .finally(() => setFetching(false));
  }, [id, form]);

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

  const removeIngredient = (idToRemove: string) => {
    setActiveIngredientsList((prev) => prev.filter((p) => p.id !== idToRemove));
  };

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
        generic_name: data.generic_name,
        description: data.description,
        // only include picture when non-empty to avoid backend `url` validation
        ...(data.picture && data.picture !== ""
          ? { picture: data.picture }
          : {}),
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/drugs/${id}`,
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
        if (response.ok && resultObj && resultObj.success === true) {
          router.push("/dashboard/");
        } else {
          const msg =
            typeof resultObj.error === "string"
              ? resultObj.error
              : "Failed to update drug";
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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Edit Drug</CardTitle>
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
                          onValueChange={(v) =>
                            setSelectedIngredient(v || null)
                          }
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
                                  {ingredients.find((i) => i.id === a.id)
                                    ?.name ?? a.id}
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
                      {loading ? "Updating..." : "Update Drug"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
