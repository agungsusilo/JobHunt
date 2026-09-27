import { supabase } from "./supabase/client";
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
} from "./types";

export async function listApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Application[];
}

export async function createApplication(
  input: ApplicationInput,
): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}

export async function updateApplication(
  id: string,
  input: Partial<ApplicationInput>,
): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<Application> {
  return updateApplication(id, { status });
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpsertApplications(
  rows: ApplicationInput[],
): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .upsert(rows, { onConflict: "job_url" })
    .select();
  if (error) throw error;
  return data as Application[];
}
