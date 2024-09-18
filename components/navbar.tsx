"use client";
import { useRouter } from "next/navigation";
import { ThemeSwitch } from "./theme-switch";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  const redirect = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    async function getUser() {
      const { data: user, error: userEroor } = await supabase.auth.getUser();
      setUser(user.user);
      if (userEroor) {
        return;
      }
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", user.user.id)
          .single();
        setProfile(data);

        if (error) {
          toast.error("Failed to load profile");
        }
      }
    }
    getUser();
  }, [supabase]);

  return (
    <nav className="container mx-auto p-6">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-foreground"
        >
          SensorHub
        </motion.h1>
        <div>
          <Button
            variant="ghost"
            onClick={() => {
              redirect("/");
            }}
          >
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              redirect("/dashboard");
            }}
          >
            Dashboard
          </Button>
        </div>
        <div className="space-x-4 flex items-center">
          <ThemeSwitch />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={profile?.avatar_url as string}
                    alt={profile?.username as string}
                  />
                  <AvatarFallback>
                    {profile?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => redirect("/profile")}>
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={async () => {
                      toast.promise(supabase.auth.signOut(), {
                        loading: "Logging out...",
                        success: "Logged out successfully",
                        error: "Failed to logout",
                      });
                      setUser(null);
                      setProfile(null);
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                redirect("/auth");
              }}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
