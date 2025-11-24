"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileEditPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          router.push("/auth/login");
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          if (contentType.includes("application/json")) {
            const data = await res.json();
            console.error("Profile load error:", data);
          } else {
            const txt = await res.text();
            console.error("Profile load error (non-json):", txt);
          }
          setLoading(false);
          return;
        }

        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success) {
            setFullName(data.data.full_name || "");
            setUsername(data.data.username || "");
            setEmail(data.data.email || "");
          }
        } else {
          const txt = await res.text();
          console.error(
            "Unexpected response when fetching profile for edit:",
            txt
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload: any = {
      full_name: fullName,
      username,
      email,
    };
    if (password) payload.password = password;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        router.push("/auth/login");
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = await res.json();
          alert(data.error || "Failed to update profile");
        } else {
          const txt = await res.text();
          alert("Failed to update profile: " + txt);
        }
        return;
      }

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          router.push("/profile");
        } else {
          alert(data.error || "Failed to update profile");
        }
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading)
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
        <div className="mt-4 space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-full rounded-md" />

          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-full rounded-md" />

          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-full rounded-md" />

          <Skeleton className="h-6 w-80 mt-2" />
          <Skeleton className="h-10 w-full rounded-md" />

          <div className="flex gap-2 mt-4">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Full name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <Label>Password (leave blank to keep current)</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/profile")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
