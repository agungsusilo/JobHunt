import { supabase } from "./supabase/client";
import type { Profile, ProfileInput } from "./types";

const CV_BUCKET = "cv-uploads";
export const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const CV_ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function saveProfile(
  id: string | null,
  input: ProfileInput,
): Promise<Profile> {
  if (id) {
    const { data, error } = await supabase
      .from("profile")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  }

  const { data, error } = await supabase
    .from("profile")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadCv(file: File): Promise<{ path: string }> {
  const path = `cv/${Date.now()}-${sanitizeFilename(file.name)}`;
  const { error } = await supabase.storage
    .from(CV_BUCKET)
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return { path };
}

export async function deleteCvFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(CV_BUCKET).remove([path]);
  if (error) throw error;
}

export function getCvUrl(path: string): string {
  return supabase.storage.from(CV_BUCKET).getPublicUrl(path).data.publicUrl;
}
