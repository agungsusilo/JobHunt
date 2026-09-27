"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { listApplications } from "@/lib/applications";
import type { Application } from "@/lib/types";

interface UseApplicationsResult {
  applications: Application[];
  loading: boolean;
  error: string | null;
}

export function useApplications(): UseApplicationsResult {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listApplications()
      .then((data) => {
        if (!cancelled) setApplications(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const channel = supabase
      .channel("applications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        (payload) => {
          setApplications((current) => {
            if (payload.eventType === "DELETE") {
              const deletedId = (payload.old as { id: string }).id;
              return current.filter((a) => a.id !== deletedId);
            }
            const row = payload.new as Application;
            const exists = current.some((a) => a.id === row.id);
            if (exists) {
              return current.map((a) => (a.id === row.id ? row : a));
            }
            return [row, ...current];
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { applications, loading, error };
}
