"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchSession() {
  const response = await fetch("/api/auth/session");
  if (!response.ok) {
    throw new Error("Unable to load session");
  }
  return response.json() as Promise<{ user: { id: string; name: string; role: string; email: string } | null }>;
}

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession
  });
}
