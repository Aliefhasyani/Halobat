"use client";

import { AppSidebar } from "@/app/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/custom/dashboard-navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UsersDatatable } from "./users/users-datatable";
import { RolesDatatable } from "./roles/roles-datatable";
import { DrugsDatatable } from "./drugs/drugs-datatable";
import { ManufacturersDatatable } from "./manufacturers/manufacturers-datatable";
import { DosageFormsDatatable } from "./dosage-forms/dosage-forms-datatable";
import { ActiveIngredientsDatatable } from "./active-ingredients/active-ingredients-datatable";
import { DiagnosesDatatable } from "./diagnoses/diagnoses-datatable";

export default function Page() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("users");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Not logged in -> send to login
      router.push("/auth/login");
      return;
    }

    // Instead of relying on a client-stored role, validate server-side via /api/profile
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const json = await res.json();
        const role = (json.success ? json.data.role : "").toLowerCase();
        if (role !== "admin" && role !== "superadmin") {
          // Non-admin users should not access dashboard; redirect to home
          router.push("/");
        }
      } catch (err) {
        console.warn("profile check failed:", err);
        // If profile fetch fails treat as not authorized
        router.push("/");
      }
    })();
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />
      <SidebarInset>
        <DashboardNavbar />
        <div className="flex flex-1 flex-col gap-4 p-4">
          {activeMenu === "users" && <UsersDatatable />}
          {activeMenu === "roles" && <RolesDatatable />}
          {activeMenu === "drugs" && <DrugsDatatable />}
          {activeMenu === "manufacturers" && <ManufacturersDatatable />}
          {activeMenu === "dosage-forms" && <DosageFormsDatatable />}
          {activeMenu === "active-ingredients" && (
            <ActiveIngredientsDatatable />
          )}
          {activeMenu === "diagnoses" && <DiagnosesDatatable />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
