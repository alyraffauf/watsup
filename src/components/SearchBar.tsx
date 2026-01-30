import { useState } from "react";

const engines = [
  { name: "Google", url: "https://www.google.com/search?q=" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  { name: "Kagi", url: "https://kagi.com/search?q=" },
];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState(
    engines.find((e) => e.name === "DuckDuckGo")!,
  );

  return (
    <form
      className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg"
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) {
          window.location.href = engine.url + encodeURIComponent(query);
        }
      }}
    >
      <div className="flex gap-2">
        <select
          value={engine.name}
          onChange={(e) =>
            setEngine(engines.find((eng) => eng.name === e.target.value)!)
          }
          className="px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white focus:outline-none focus:border-zinc-500"
        >
          {engines.map((eng) => (
            <option key={eng.name} value={eng.name}>
              {eng.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
      </div>
    </form>
  );
}
