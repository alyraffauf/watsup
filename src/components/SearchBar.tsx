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
      className="h-full flex-1 p-4 rounded-xl bg-white/5 border border-rose-400/20 flex flex-col justify-center"
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) {
          window.location.href = engine.url + encodeURIComponent(query);
        }
      }}
    >
      <div className="flex flex-col md:flex-row gap-2">
        <select
          value={engine.name}
          onChange={(e) =>
            setEngine(engines.find((eng) => eng.name === e.target.value)!)
          }
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
        >
          {engines.map((eng) => (
            <option
              key={eng.name}
              value={eng.name}
              className="bg-zinc-900 text-white"
            >
              {eng.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 min-w-0 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
        />
      </div>
    </form>
  );
}
