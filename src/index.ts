import { serve } from "bun";
import index from "./index.html";
import { privateApps } from "./data/privateApps";
import { websites } from "./data/websites";

let hnCache: { stories: any[]; fetchedAt: number } | null = null;

async function checkStatuses(items: { name: string; url: string }[]) {
  const results = await Promise.all(
    items.map(async (item) => {
      try {
        const response = await fetch(item.url, {
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
    // Serve index.html for all unmatched routes.
    "/*": index,

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

    "/api/weather": {
      async GET(req) {
        const url = new URL(req.url);
        const lat = url.searchParams.get("lat");
        const lon = url.searchParams.get("lon");

        const pointsResponse = await fetch(
          `https://api.weather.gov/points/${lat},${lon}`,
        );

        const pointsData = await pointsResponse.json();
        const forecastUrl = pointsData.properties.forecast;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        return Response.json(forecastData.properties.periods[0]);
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
