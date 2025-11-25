import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  User,
  Shield,
  Pill,
  Building,
  Package,
  TestTube,
  Heart,
} from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
}

export function AppSidebar({
  activeMenu,
  onMenuClick,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/" className="flex items-center justify-center gap-3">
          <Image
            src="/Halobat-Logo.png"
            alt="Halobat logo"
            width={140}
            height={36}
            className="object-contain"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Users</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activeMenu === "users"}>
                  <button onClick={() => onMenuClick("users")}>
                    <User className="w-4 h-4" />
                    Users
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activeMenu === "roles"}>
                  <button onClick={() => onMenuClick("roles")}>
                    <Shield className="w-4 h-4" />
                    Roles
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Pharmaceutical</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={activeMenu === "drugs"}>
                  <button onClick={() => onMenuClick("drugs")}>
                    <Pill className="w-4 h-4" />
                    Drugs
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeMenu === "manufacturers"}
                >
                  <button onClick={() => onMenuClick("manufacturers")}>
                    <Building className="w-4 h-4" />
                    Manufacturers
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeMenu === "dosage-forms"}
                >
                  <button onClick={() => onMenuClick("dosage-forms")}>
                    <Package className="w-4 h-4" />
                    Dosage Forms
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeMenu === "active-ingredients"}
                >
                  <button onClick={() => onMenuClick("active-ingredients")}>
                    <TestTube className="w-4 h-4" />
                    Ingredients
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Medical</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={false}>
                  <a href="#">
                    <Heart className="w-4 h-4" />
                    Diagnoses
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
