import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// page no longer uses the shared DrugCard preview — render a product-style layout

type SearchParams = { id?: string; type?: string };

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const id = searchParams?.id;
  const type = searchParams?.type ?? "generic";

  if (!id) {
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold">No drug id provided</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open a drug from a list by clicking &quot;View&quot;.
        </p>
      </div>
    );
  }

  // Support an explicit API base URL (e.g. NEXT_PUBLIC_API_BASE_URL) or fall back
  // to a relative path. This lets developers run frontend and backend separately.
  // Build a safe absolute URL for `fetch` so server-side fetch won't throw.
  // Follow the same env var convention used across the app: prefer
  // NEXT_PUBLIC_BASE_URL (set in this project), then NEXT_PUBLIC_API_BASE_URL,
  // then NEXT_PUBLIC_SITE_URL and finally localhost for local dev.
  const route = type === "brand" ? `/api/brands/${id}` : `/api/drugs/${id}`;
  const origin =
    (process.env.NEXT_PUBLIC_BASE_URL &&
      process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "")) ||
    (process.env.NEXT_PUBLIC_API_BASE_URL &&
      process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")) ||
    (process.env.NEXT_PUBLIC_SITE_URL &&
      process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")) ||
    "http://localhost:3000";

  const fetchUrl = new URL(route, origin).toString();

  try {
    const res = await fetch(fetchUrl, { cache: "no-store" });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `HTTP ${res.status}`);
    }

    const payload = await res.json();
    const item = payload?.data ?? null;

    if (!item) {
      return (
        <div className="p-8">
          <h2 className="text-lg font-semibold">Item not found</h2>
        </div>
      );
    }

    // Normalize values so we can render both drug and brand responses
    const isBrand = type === "brand";
    const name = isBrand
      ? item.name ?? item.drug?.generic_name
      : item.generic_name ?? item.name;
    const price = item.price ?? (item.drug ? item.drug.price : undefined);
    const picture = item.picture ?? (item.drug ? item.drug.picture : null);
    const manufacturer = isBrand
      ? item.drug?.manufacturer?.name ?? item.manufacturer?.name
      : item.manufacturer?.name ?? item.manufacturer_data?.name;
    const dosage = isBrand
      ? item.drug?.dosageForm?.name ?? item.dosage_form_data?.name
      : item.dosageForm?.name ?? item.dosage_form_data?.name;

    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Link
              href="/"
              aria-label="Back"
              className="inline-flex items-center p-2 md:p-4 rounded-full"
            >
              <ArrowLeft className="h-4 w-4 text-pink-500" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="w-full bg-muted/10 rounded-lg overflow-hidden flex items-center justify-center p-4 md:p-8">
            {/* Large image on the left (e-commerce style) */}
            {/* server-side fallback URL; no client event handlers in this server component */}
            <img
              src={
                picture ??
                `https://picsum.photos/seed/${encodeURIComponent(id)}/800/800`
              }
              alt={name ?? "product image"}
              className="w-full max-w-md h-auto object-contain rounded-lg shadow-sm"
            />
          </div>

          <div className="bg-card p-6 rounded-lg">
            {/* Duplicate header info here so details column also contains the title/manufacturer */}
            <div className="mb-4 text-left">
              <h1 className="text-2xl font-bold">{name}</h1>
              <div className="mt-1 text-sm text-muted-foreground">
                {manufacturer || dosage}
              </div>
            </div>

            <h2 className="text-lg font-semibold">Details</h2>

            <div className="mt-4 space-y-6 text-sm text-muted-foreground">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <strong className="text-2xl font-bold text-foreground">
                    {price ? `$${price}` : "—"}
                  </strong>
                  <div className="text-xs text-muted-foreground/80 mt-1">
                    {isBrand ? "Brand" : "Generic"}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="mb-1">
                    <strong className="text-xs text-muted-foreground/90">
                      Manufacturer
                    </strong>
                  </div>
                  <div className="text-sm text-foreground">
                    {manufacturer ?? "—"}
                  </div>
                </div>
              </div>

              <div>
                <strong className="block text-xs text-muted-foreground/90">
                  Dosage form
                </strong>
                <div className="mt-1">{dosage ?? "—"}</div>
              </div>

              <div>
                <strong className="block text-xs text-muted-foreground/90">
                  Description
                </strong>
                <div className="mt-1 text-sm text-foreground">
                  {item.description ?? "—"}
                </div>
              </div>

              {item.activeIngredients && item.activeIngredients.length > 0 && (
                <div>
                  <strong className="block text-xs text-muted-foreground/90">
                    Active ingredients
                  </strong>
                  <ul className="mt-2 space-y-1 list-disc pl-5">
                    {item.activeIngredients.map(
                      (ai: {
                        id: string;
                        name?: string;
                        active_ingredient_name?: string;
                        pivot?: { quantity?: number } | null;
                        quantity?: number | null;
                      }) => (
                        <li key={ai.id}>
                          {ai.name ?? ai.active_ingredient_name ?? "Unnamed"} —{" "}
                          {ai.pivot?.quantity ?? ai.quantity ?? "—"}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    const msg = (err as Error)?.message ?? "Unknown error";
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold">Error loading drug</h2>
        <p className="mt-2 text-sm text-destructive">{msg}</p>
      </div>
    );
  }
}
