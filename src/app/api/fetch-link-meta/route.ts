import { NextResponse } from "next/server";
import { fetchLinkMeta } from "@/lib/linkMeta";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const meta = await fetchLinkMeta(url);
  return NextResponse.json(meta);
}
