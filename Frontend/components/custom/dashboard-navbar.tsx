"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
}

export function DashboardNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");
    setIsAuthenticated(!!token);
    if (user_id) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.data);
          } else {
            setUser(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1 flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1 flex items-center justify-between">
        <div>
          <div className="font-semibold">{user?.username || "Guest"}</div>
          <div className="text-sm text-muted-foreground">
            {user?.role || "Not logged in"}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="" alt="User" />
              <AvatarFallback>
                {user?.full_name ? getInitials(user.full_name) : "G"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {isAuthenticated && <DropdownMenuItem>Profile</DropdownMenuItem>}
            {!isAuthenticated && (
              <DropdownMenuItem onClick={() => router.push("/auth/login")}>
                Login
              </DropdownMenuItem>
            )}
            {isAuthenticated && (
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
