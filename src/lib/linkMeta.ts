import * as cheerio from "cheerio";

export interface LinkMeta {
  title: string | null;
  siteName: string | null;
  guessedCompany: string | null;
  guessedPosition: string | null;
}

const SEPARATORS = [" at ", " @ ", " - ", " – ", " | ", " · "];

function splitTitle(raw: string): { position: string; company: string | null } {
  for (const sep of SEPARATORS) {
    const idx = raw.indexOf(sep);
    if (idx > 0) {
      return {
        position: raw.slice(0, idx).trim(),
        company: raw.slice(idx + sep.length).trim() || null,
      };
    }
  }
  return { position: raw.trim(), company: null };
}

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".local")) return true;
  if (/^127\./.test(lower) || lower === "0.0.0.0") return true;
  if (/^10\./.test(lower)) return true;
  if (/^192\.168\./.test(lower)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(lower)) return true;
  return false;
}

export async function fetchLinkMeta(rawUrl: string): Promise<LinkMeta> {
  const empty: LinkMeta = {
    title: null,
    siteName: null,
    guessedCompany: null,
    guessedPosition: null,
  };

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return empty;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return empty;
  if (isBlockedHost(url.hostname)) return empty;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return empty;

    const html = (await res.text()).slice(0, 300_000);
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
    const ogSiteName = $('meta[property="og:site_name"]').attr("content")?.trim();
    const titleTag = $("title").first().text().trim();

    const title = ogTitle || titleTag || null;
    const siteName = ogSiteName || null;

    if (!title) return { ...empty };

    const { position, company } = splitTitle(title);

    return {
      title,
      siteName,
      guessedPosition: position || null,
      guessedCompany: siteName || company,
    };
  } catch {
    return empty;
  } finally {
    clearTimeout(timeout);
  }
}
