"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, X, Filter } from "lucide-react";
import Navbar from "@/components/custom/navbar";
import DrugCard from "@/components/custom/drug-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Drug = {
  type: "generic" | "brand";
  id: string;
  name: string;
  description?: string;
  picture?: string | null;
  price?: string | number;
  manufacturer_data?: { id: string; name: string } | null;
  dosage_form_data?: { id: string; name: string } | null;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Drug[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterManufacturer, setFilterManufacturer] = useState<string>("all");
  const [filterDosageForm, setFilterDosageForm] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/drugs`
        );
        const json = await res.json();
        if (json.success) setData(json.data || []);
      } catch (err) {
        console.error("fetch drugs error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrugs();
  }, []);

  const manufacturers = useMemo(() => {
    const unique = new Set<string>();
    data.forEach((d) => {
      if (d.manufacturer_data?.name) unique.add(d.manufacturer_data.name);
    });
    return Array.from(unique).sort();
  }, [data]);

  const dosageForms = useMemo(() => {
    const unique = new Set<string>();
    data.forEach((d) => {
      if (d.dosage_form_data?.name) unique.add(d.dosage_form_data.name);
    });
    return Array.from(unique).sort();
  }, [data]);

  const filtered = useMemo(() => {
    let result = data;

    // Search filter
    const q = (search || "").trim().toLowerCase();
    if (q) {
      result = result.filter((d) => (d.name || "").toLowerCase().includes(q));
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter((d) => d.type === filterType);
    }

    // Manufacturer filter
    if (filterManufacturer !== "all") {
      result = result.filter(
        (d) => d.manufacturer_data?.name === filterManufacturer
      );
    }

    // Dosage form filter
    if (filterDosageForm !== "all") {
      result = result.filter(
        (d) => d.dosage_form_data?.name === filterDosageForm
      );
    }

    // Price filter
    const minPrice = priceMin ? parseFloat(priceMin) : null;
    const maxPrice = priceMax ? parseFloat(priceMax) : null;
    if (minPrice !== null || maxPrice !== null) {
      result = result.filter((d) => {
        const price = d.price ? parseFloat(String(d.price)) : null;
        if (price === null) return false;
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
        return true;
      });
    }

    return result;
  }, [
    data,
    search,
    filterType,
    filterManufacturer,
    filterDosageForm,
    priceMin,
    priceMax,
  ]);

  const hasActiveFilters =
    filterType !== "all" ||
    filterManufacturer !== "all" ||
    filterDosageForm !== "all" ||
    priceMin !== "" ||
    priceMax !== "";

  const clearFilters = () => {
    setFilterType("all");
    setFilterManufacturer("all");
    setFilterDosageForm("all");
    setPriceMin("");
    setPriceMax("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background">
        <Navbar showSearch value={search} onSearch={setSearch} />
      </div>

      <main className="max-w-[1200px] mx-auto p-6 md:p-10">
        {/* Filter Section */}
        {showFilters && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Type Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Type
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="generic">Generic</SelectItem>
                    <SelectItem value="brand">Branded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Manufacturer Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Manufacturer
                </label>
                <Select
                  value={filterManufacturer}
                  onValueChange={setFilterManufacturer}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All manufacturers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All manufacturers</SelectItem>
                    {manufacturers.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dosage Form Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Dosage Form
                </label>
                <Select
                  value={filterDosageForm}
                  onValueChange={setFilterDosageForm}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All forms</SelectItem>
                    {dosageForms.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Min Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Min Price
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="h-9"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Price Max Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Max Price
                </label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-9"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium">All Medicines</h2>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Filtered results"
                  : "Browse our complete catalog of medicines."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Filters"}
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {
                    [
                      filterType !== "all",
                      filterManufacturer !== "all",
                      filterDosageForm !== "all",
                      priceMin !== "",
                      priceMax !== "",
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-2">
                  <Skeleton className="h-36 w-full rounded-xl" />
                </div>
              ))
            ) : filtered.length ? (
              filtered.map((d) => (
                <div key={d.id} className="p-2">
                  <DrugCard
                    id={d.id}
                    name={d.name}
                    price={d.price}
                    type={d.type}
                    picture={d.picture}
                    manufacturer={d.manufacturer_data?.name ?? null}
                    dosageForm={d.dosage_form_data?.name ?? null}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No medicines found.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Chat action button */}
      <div className="fixed right-6 bottom-6 md:right-10 md:bottom-10 z-50">
        <Link href="/chat" aria-label="Open chat">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-full shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50">
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </Link>
      </div>
    </div>
  );
}
