"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import Navbar from "@/components/custom/navbar";
import DrugCard from "@/components/custom/drug-card";
import { Skeleton } from "@/components/ui/skeleton";

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

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) => (d.name || "").toLowerCase().includes(q));
  }, [data, search]);

  const generic = filtered.filter((d) => d.type === "generic");
  const brands = filtered.filter((d) => d.type === "brand");

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background">
        <Navbar showSearch value={search} onSearch={setSearch} />
      </div>

      <main className="max-w-[1200px] mx-auto p-6 md:p-10">
        <h1 className="text-2xl font-semibold mb-4">Discover Medicines</h1>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium">Generic Drugs</h2>
              <p className="text-sm text-muted-foreground">
                Commonly-used generics.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                `${generic.length} item(s)`
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-2">
                  <Skeleton className="h-36 w-full rounded-xl" />
                </div>
              ))
            ) : generic.length ? (
              generic.map((d) => (
                <div key={d.id} className="p-2">
                  <DrugCard
                    id={d.id}
                    name={d.name}
                    price={d.price}
                    type={d.type}
                    picture={d.picture}
                    manufacturer={d.manufacturer_data?.name ?? null}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No generic drugs found.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium">Branded Drugs</h2>
              <p className="text-sm text-muted-foreground">
                Products sold under brand names.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                `${brands.length} item(s)`
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-2">
                  <Skeleton className="h-36 w-full rounded-xl" />
                </div>
              ))
            ) : brands.length ? (
              brands.map((d) => (
                <div key={d.id} className="p-2">
                  <DrugCard
                    id={d.id}
                    name={d.name}
                    price={d.price}
                    type={d.type}
                    picture={d.picture}
                    manufacturer={d.manufacturer_data?.name ?? null}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No branded drugs found.
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
