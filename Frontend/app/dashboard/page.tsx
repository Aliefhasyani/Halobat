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

export default function Page() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("users");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.push("/auth/login");
    }
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
