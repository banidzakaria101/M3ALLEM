"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export type UserRole = "customer" | "worker" | "admin";

export interface AuthUser extends User {
  role?: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const init = async () => {
      try {
        // Force loading to complete after 4 seconds (prevents stuck state)
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn("⏱️ Auth timeout - forcing completion");
            setLoading(false);
          }
        }, 4000);

        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (isMounted && session?.user) {
          // Try to fetch role, but don't wait forever
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();

            setUser({
              ...session.user,
              role: (profileData?.role || "customer") as UserRole,
            });
          } catch {
            // Fallback if profile query fails
            setUser({ ...session.user, role: "customer" });
          }
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    init();

    // ✅ FIXED: Correctly destructure subscription from .data
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!isMounted) return;

      if (session?.user) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setUser({
            ...session.user,
            role: (profileData?.role || "customer") as UserRole,
          });
        } catch {
          setUser({ ...session.user, role: "customer" });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      // ✅ FIXED: Access subscription via authListener.data
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}