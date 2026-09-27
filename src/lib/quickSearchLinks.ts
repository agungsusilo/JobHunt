export interface QuickSearchParams {
  query: string;
  location: string;
  remoteOnly: boolean;
}

export interface QuickSearchLink {
  label: string;
  url: string;
}

export function buildQuickSearchLinks({
  query,
  location,
  remoteOnly,
}: QuickSearchParams): QuickSearchLink[] {
  const q = query.trim();
  const loc = location.trim();
  const remoteSuffix = remoteOnly ? " remote" : "";

  const linkedInParams = new URLSearchParams({ keywords: q });
  if (loc) linkedInParams.set("location", loc);
  if (remoteOnly) linkedInParams.set("f_WT", "2");

  const indeedParams = new URLSearchParams({ q });
  if (loc) indeedParams.set("l", loc);
  else if (remoteOnly) indeedParams.set("l", "Remote");

  const glassdoorKeyword = [q, remoteSuffix].filter(Boolean).join("");
  const glassdoorParams = new URLSearchParams({
    "sc.keyword": glassdoorKeyword,
  });
  if (loc) glassdoorParams.set("locKeyword", loc);

  const googleQuery = [q, "jobs", loc, remoteSuffix.trim()]
    .filter(Boolean)
    .join(" ");
  const googleParams = new URLSearchParams({ q: googleQuery, ibp: "htl;jobs" });

  return [
    {
      label: "LinkedIn",
      url: `https://www.linkedin.com/jobs/search/?${linkedInParams.toString()}`,
    },
    {
      label: "Indeed",
      url: `https://www.indeed.com/jobs?${indeedParams.toString()}`,
    },
    {
      label: "Glassdoor",
      url: `https://www.glassdoor.com/Job/jobs.htm?${glassdoorParams.toString()}`,
    },
    {
      label: "Google Jobs",
      url: `https://www.google.com/search?${googleParams.toString()}`,
    },
  ];
}
