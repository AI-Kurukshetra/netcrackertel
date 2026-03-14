"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeSync } from "@/components/theme-sync";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { DEMO_MODE } from "@/lib/data-mode";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (DEMO_MODE) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("telecosync-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "*"
        },
        () => {
          queryClient.invalidateQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      {children}
    </QueryClientProvider>
  );
}
