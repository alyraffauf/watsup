import { useState, useEffect } from "react";

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
    <div className="card p-4">
      <ul className="space-y-2">
        {stories.map((story) => (
          <li key={story.id} className="flex gap-3 text-sm">
            <span className="text-zinc-500 w-8 shrink-0">{story.score}↑</span>

            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-white hover:underline"
            >
              {story.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
