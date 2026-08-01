import { useEffect, useState } from "react";
import Layout from "./Layout";
import { HackerNews } from "./components/HackerNews";
import { Lobsters } from "./components/Lobsters";
import { SearchBar } from "./components/SearchBar";
import ServiceGrid from "./components/ServiceGrid";
import { Weather } from "./components/Weather";
import type {
  DashboardConfig,
  DashboardSection,
  GridColumns,
  Widget,
} from "./types";

const GRID_COLUMNS: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const GRID_SPANS: Record<GridColumns, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};

export function App() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.json() as Promise<DashboardConfig>;
      })
      .then((loadedConfig) => {
        setConfig(loadedConfig);
        if (loadedConfig.title) document.title = loadedConfig.title;
      })
      .catch(() => setError("Dashboard configuration could not be loaded."));
  }, []);

  if (error) return <DashboardMessage message={error} />;
  if (!config) return <DashboardMessage message="Loading dashboard…" />;

  return (
    <Layout>
      <div className="space-y-10">
        {config.sections.map((section, index) => (
          <DashboardSectionView key={index} section={section} />
        ))}
      </div>
    </Layout>
  );
}

function DashboardMessage({ message }: { message: string }) {
  return (
    <Layout>
      <div className="card p-4 text-zinc-400">{message}</div>
    </Layout>
  );
}

function DashboardSectionView({ section }: { section: DashboardSection }) {
  if (section.type === "services") {
    return (
      <section>
        <h2 className="section-heading mb-3">{section.title}</h2>
        <ServiceGrid
          services={section.services}
          columns={section.columns}
          refreshInterval={section.refreshInterval}
        />
      </section>
    );
  }

  const columns = section.columns ?? 1;

  return (
    <section className={`grid gap-4 ${GRID_COLUMNS[columns]}`}>
      {section.widgets.map((widget, index) => (
        <div key={index} className={GRID_SPANS[widget.span ?? 1]}>
          <WidgetView widget={widget} />
        </div>
      ))}
    </section>
  );
}

function WidgetView({ widget }: { widget: Widget }) {
  const content = renderWidget(widget);
  if (!widget.title) return content;

  return (
    <>
      <h2 className="section-heading mb-3">{widget.title}</h2>
      {content}
    </>
  );
}

function renderWidget(widget: Widget) {
  switch (widget.type) {
    case "weather":
      return <Weather />;
    case "search":
      return <SearchBar />;
    case "lobsters":
      return <Lobsters />;
    case "hacker-news":
      return <HackerNews />;
  }
}

export default App;
