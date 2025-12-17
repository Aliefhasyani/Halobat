"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";

type NavbarProps = {
  showSearch?: boolean; // default true
  value?: string;
  onSearch?: (val: string) => void;
};

export default function Navbar({
  showSearch = true,
  value = "",
  onSearch,
}: NavbarProps) {
  const [search, setSearch] = useState(value ?? "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setName(localStorage.getItem("username"));

    // Fetch user role from API if authenticated
    if (token) {
      (async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const json = await res.json();
          if (json.success) {
            setRole(json.data.role?.toLowerCase() || null);
          }
        } catch (err) {
          console.warn("Failed to fetch user role:", err);
        }
      })();
    }
  }, []);

  useEffect(() => {
    setSearch(value ?? "");
  }, [value]);

  function change(v: string) {
    setSearch(v);
    onSearch?.(v);
  }

  return (
    <header className="w-full border-b h-16 flex items-center px-6">
      <div className="flex items-center gap-4 w-full max-w-[1200px] mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/Halobat-Logo.png"
            alt="Halobat"
            width={120}
            height={36}
            className="object-contain"
          />
        </Link>

        {showSearch && (
          <div className="flex-1 relative">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 opacity-50 size-4" />
            <Input
              value={search}
              onChange={(e) => change(e.target.value)}
              placeholder="Search drugs or branded drugs..."
              className="pl-10"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src="" alt={name ?? "User"} />
                  <AvatarFallback>
                    {(name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                {(role === "admin" || role === "superadmin") && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <a
                    href="#"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user_id");
                      window.location.href = "/";
                    }}
                  >
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
