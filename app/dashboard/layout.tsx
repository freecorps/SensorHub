"use client";
import Navbar from "@/components/navbar";
import { createClient } from "@/utils/supabase/client";
import type { Metadata } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function RootLayoutDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    async function getUser() {
      const { data: user, error: userEroor } = await supabase.auth.getUser();
      if (userEroor) {
        toast.error("Failed to load user");
        return router.push("/auth");
      }
      if (!user) {
        toast.error("This page requires authentication, please login first");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return router.push("/auth");
      }
    }
    getUser();
  }, [supabase, router]);

  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
