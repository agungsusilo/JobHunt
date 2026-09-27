import { NextResponse } from "next/server";
import { aggregateJobSearch } from "@/lib/jobSearch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? "";
  const remoteOnly = searchParams.get("remote") === "true";

  const { results, totalAvailable } = await aggregateJobSearch({
    query,
    location,
    remoteOnly,
  });
  return NextResponse.json({ results, totalAvailable });
}
