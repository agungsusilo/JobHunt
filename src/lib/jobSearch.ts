export interface JobSearchResult {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  url: string;
  source: "arbeitnow" | "remoteok";
  sourceUrl: string;
  publishedAt: number | null;
}

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  remote: boolean;
  url: string;
  location: string;
  tags: string[];
  created_at: number;
}

interface RemoteOkJob {
  id?: string;
  slug?: string;
  position?: string;
  company?: string;
  location?: string;
  tags?: string[];
  url?: string;
  apply_url?: string;
  epoch?: number;
}

const REMOTEOK_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function fetchArbeitnow(): Promise<JobSearchResult[]> {
  try {
    // Not using `next.revalidate` here: the response is ~4MB, over Next's
    // 2MB data-cache item limit, so caching it would just log a warning.
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ArbeitnowJob[] };
    return json.data.map((job) => ({
      id: `arbeitnow-${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.location || null,
      remote: job.remote,
      url: job.url,
      source: "arbeitnow" as const,
      sourceUrl: job.url,
      publishedAt: job.created_at ?? null,
    }));
  } catch {
    return [];
  }
}

async function fetchRemoteOk(): Promise<JobSearchResult[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": REMOTEOK_USER_AGENT },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as RemoteOkJob[];
    return json
      .filter((job) => job.id && job.position)
      .map((job) => ({
        id: `remoteok-${job.id}`,
        title: job.position!,
        company: job.company || "Unknown",
        location: job.location || null,
        remote: true,
        url: job.url || job.apply_url || `https://remoteok.com/remote-jobs/${job.slug}`,
        source: "remoteok" as const,
        sourceUrl: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
        publishedAt: job.epoch ?? null,
      }));
  } catch {
    return [];
  }
}

export interface JobSearchParams {
  query: string;
  location: string;
  remoteOnly: boolean;
}

function matchesQuery(job: JobSearchResult, query: string): boolean {
  if (!query) return true;
  const haystack = job.title.toLowerCase();
  const companyHaystack = job.company.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every(
    (term) => haystack.includes(term) || companyHaystack.includes(term),
  );
}

function matchesLocation(job: JobSearchResult, location: string): boolean {
  if (!location) return true;
  if (job.remote) return true; // remote jobs match any location filter
  return (job.location ?? "").toLowerCase().includes(location.toLowerCase());
}

export async function aggregateJobSearch({
  query,
  location,
  remoteOnly,
}: JobSearchParams): Promise<JobSearchResult[]> {
  const [arbeitnow, remoteOk] = await Promise.all([
    fetchArbeitnow(),
    fetchRemoteOk(),
  ]);

  const seen = new Set<string>();
  const combined = [...arbeitnow, ...remoteOk].filter((job) => {
    if (seen.has(job.url)) return false;
    seen.add(job.url);
    return true;
  });

  const filtered = combined.filter(
    (job) =>
      matchesQuery(job, query) &&
      matchesLocation(job, location) &&
      (!remoteOnly || job.remote),
  );

  filtered.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));

  return filtered.slice(0, 30);
}
