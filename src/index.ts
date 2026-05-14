import { serve } from "bun";
import { join } from "path";
import { privateApps } from "./data/privateApps";
import { websites } from "./data/websites";

const distDir = join(import.meta.dir, "..", "dist");

let hnCache: { stories: any[]; fetchedAt: number } | null = null;
let lobstersCache: { stories: any[]; fetchedAt: number } | null = null;

type Favicon = { body: ArrayBuffer; contentType: string };
type CachedFavicon = Favicon & { fetchedAt: number };

const faviconCache = new Map<string, CachedFavicon>();
const FAVICON_CACHE_MS = 24 * 60 * 60 * 1000;

const NAMED_HTML_ENTITIES: Record<string, string> = {
  lt: "<",
  gt: ">",
  amp: "&",
  quot: '"',
  apos: "'",
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (full, code) => {
    if (code.startsWith("#x"))
      return String.fromCodePoint(parseInt(code.slice(2), 16));
    if (code.startsWith("#"))
      return String.fromCodePoint(parseInt(code.slice(1), 10));
    return NAMED_HTML_ENTITIES[code] ?? full;
  });
}

async function fetchIcon(iconUrl: string): Promise<Favicon | null> {
  try {
    const response = await fetch(iconUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;

    // For data: URIs the mime type lives in the URL itself (e.g. `data:image/svg+xml,...`).
    // Bun's fetch doesn't always copy it onto the response, so pull it out manually.
    const dataUriMime = iconUrl.match(/^data:([^;,]+)/)?.[1];
    const contentType =
      dataUriMime ?? response.headers.get("content-type") ?? "image/x-icon";

    return { body: await response.arrayBuffer(), contentType };
  } catch {
    return null;
  }
}

async function getFavicon(siteOrigin: string): Promise<Favicon | null> {
  const cached = faviconCache.get(siteOrigin);
  if (cached && Date.now() - cached.fetchedAt < FAVICON_CACHE_MS) {
    return cached;
  }

  const freshIcon = await findFavicon(siteOrigin);
  if (!freshIcon) return null;

  faviconCache.set(siteOrigin, { ...freshIcon, fetchedAt: Date.now() });
  return freshIcon;
}

async function findFavicon(siteOrigin: string): Promise<Favicon | null> {
  try {
    const homepage = await fetch(siteOrigin, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 watsup-favicon-fetcher" },
    }).then((response) => response.text());

    const iconLinkPattern = /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi;
    for (const linkTag of homepage.match(iconLinkPattern) ?? []) {
      const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
      if (!hrefMatch) continue;

      const href = decodeHtmlEntities(hrefMatch[1]);
      const iconUrl = new URL(href, siteOrigin).toString();
      const icon = await fetchIcon(iconUrl);
      if (icon) return icon;
    }
  } catch {
    // Homepage fetch or parsing failed; fall through to the conventional path.
  }

  return fetchIcon(new URL("/favicon.ico", siteOrigin).toString());
}

async function checkStatuses(
  items: { name: string; url: string; healthUrl?: string }[],
) {
  const results = await Promise.all(
    items.map(async (item) => {
      try {
        const response = await fetch(item.healthUrl ?? item.url, {
          method: "HEAD",
          signal: AbortSignal.timeout(3000),
        });
        return { name: item.name, online: response.status < 500 };
      } catch {
        return { name: item.name, online: false };
      }
    }),
  );

  const statuses: Record<string, boolean> = {};
  for (const result of results) {
    statuses[result.name] = result.online;
  }
  return statuses;
}

const server = serve({
  hostname: "0.0.0.0",
  port: 3000,
  routes: {
    // Serve static assets from dist/, with index.html fallback for SPA routes.
    "/*": async (req) => {
      const url = new URL(req.url);
      const candidate = Bun.file(
        join(distDir, url.pathname === "/" ? "index.html" : url.pathname),
      );
      if (await candidate.exists()) return new Response(candidate);
      return new Response(Bun.file(join(distDir, "index.html")));
    },

    "/api/check": {
      async POST(req) {
        const items = await req.json();
        return Response.json(await checkStatuses(items));
      },
    },

    "/api/hackernews": {
      async GET(req) {
        if (hnCache && Date.now() - hnCache.fetchedAt < 5 * 60 * 1000) {
          return Response.json(hnCache.stories);
        }

        const ids = await fetch(
          "https://hacker-news.firebaseio.com/v0/topstories.json",
        ).then((res) => res.json());

        const stories = await Promise.all(
          ids
            .slice(0, 5)
            .map((id: number) =>
              fetch(
                `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
              ).then((res) => res.json()),
            ),
        );

        hnCache = { stories, fetchedAt: Date.now() };

        return Response.json(stories);
      },
    },

    "/api/lobsters": {
      async GET(req) {
        if (
          lobstersCache &&
          Date.now() - lobstersCache.fetchedAt < 5 * 60 * 1000
        ) {
          return Response.json(lobstersCache.stories);
        }

        const stories = await fetch("https://lobste.rs/hottest.json")
          .then((res) => res.json())
          .then((data) => data.slice(0, 5));

        lobstersCache = { stories, fetchedAt: Date.now() };

        return Response.json(stories);
      },
    },

    "/api/weather": {
      async GET(req) {
        const url = new URL(req.url);
        const lat = req.headers.get("cf-iplatitude") ?? "33.749";
        const lon = req.headers.get("cf-iplongitude") ?? "-84.388";

        try {
          const pointsResponse = await fetch(
            `https://api.weather.gov/points/${lat},${lon}`,
            {
              headers: {
                "User-Agent": "(watsup, aly@aly.codes)",
              },
            },
          );

          if (!pointsResponse.ok) {
            return Response.json(
              { error: "Weather only available for US locations" },
              { status: 400 },
            );
          }

          const pointsData = await pointsResponse.json();
          const forecastUrl = pointsData.properties?.forecastHourly;

          if (!forecastUrl) {
            return Response.json(
              { error: "Weather only available for US locations" },
              { status: 400 },
            );
          }

          const forecastResponse = await fetch(forecastUrl, {
            headers: {
              "User-Agent": "(watsup, aly@aly.codes)",
            },
          });

          if (!forecastResponse.ok) {
            return Response.json(
              { error: "Weather forecast unavailable" },
              { status: 502 },
            );
          }

          const forecastData = await forecastResponse.json();
          const location = pointsData.properties.relativeLocation.properties;

          return Response.json({
            ...forecastData.properties.periods[0],
            city: location.city,
            state: location.state,
          });
        } catch (e) {
          return Response.json(
            { error: "Weather unavailable" },
            { status: 502 },
          );
        }
      },
    },

    "/api/favicon": {
      async GET(req) {
        const urlParam = new URL(req.url).searchParams.get("url");
        if (!urlParam) return new Response("Missing url", { status: 400 });

        let siteUrl: URL;
        try {
          siteUrl = new URL(urlParam);
        } catch {
          return new Response("Invalid url", { status: 400 });
        }
        if (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") {
          return new Response("Invalid scheme", { status: 400 });
        }

        const icon = await getFavicon(siteUrl.origin);
        if (!icon) return new Response("Not found", { status: 404 });

        return new Response(icon.body, {
          headers: {
            "Content-Type": icon.contentType,
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
