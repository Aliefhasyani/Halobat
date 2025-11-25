"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          // Not authorized — clear token and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          router.push("/auth/login");
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          // Try to parse JSON error if available
          if (contentType.includes("application/json")) {
            const data = await res.json();
            console.error("Profile load error:", data);
          } else {
            const txt = await res.text();
            console.error("Profile load error (non-json):", txt);
          }
          setUser(null);
          setLoading(false);
          return;
        }

        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success) setUser(data.data);
          else setUser(null);
        } else {
          // Unexpected non-JSON response
          const txt = await res.text();
          console.error("Unexpected response when fetching profile:", txt);
          setUser(null);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading)
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />

          <Skeleton className="h-4 w-40 mt-4" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">No profile available.</p>
      </div>
    );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="" alt="User" />
          <AvatarFallback>
            {user.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-lg font-semibold">{user.full_name}</div>
          <div className="text-sm text-muted-foreground">@{user.username}</div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div>
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="font-medium">{user.email}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Role</div>
          <div className="font-medium">{user.role}</div>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => router.push("/profile/edit")}>
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
