import { useState, useEffect } from "react";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) return "1m";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function HackerNews() {
  const [stories, setStories] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackerNews = () => {
      fetch(`/api/hackernews`)
        .then((response) => response.json())
        .then((data) => setStories(data));
    };

    fetchHackerNews();
  }, []);

  if (stories.length == 0) {
    return <div>Loading stories...</div>;
  }

  return (
    <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
      <ul className="space-y-2">
        {stories.map((story) => (
          <li key={story.id} className="flex gap-3 text-sm">
            <span className="text-zinc-500 w-8 shrink-0">{story.score}↑</span>

            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-white hover:underline truncate"
            >
              {story.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
