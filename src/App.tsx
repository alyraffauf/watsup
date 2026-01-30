import Layout from "./Layout";
import ServiceGrid from "./components/ServiceGrid";
import { HackerNews } from "./components/HackerNews";
import { Lobsters } from "./components/Lobsters";
import { Weather } from "./components/Weather";
import { SearchBar } from "./components/SearchBar.tsx";
import { apps } from "./data/apps";
import { privateApps } from "./data/privateApps";
import { websites } from "./data/websites";

export function App() {
  return (
    <Layout>
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div>
          <Weather />
        </div>

        <div className="md:col-span-3">
          <SearchBar />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-white/70 mb-4">
            Lobsters
          </h2>
          <Lobsters />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white/70 mb-4">
            Hacker News
          </h2>
          <HackerNews />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-white/70 mt-8 mb-4">
        Websites
      </h2>
      <ServiceGrid services={websites} columns={2} />
      <h2 className="text-2xl font-semibold text-white/70 mt-8 mb-4">
        Public Apps
      </h2>
      <ServiceGrid services={apps} columns={4} />
      <h2 className="text-2xl font-semibold text-white/70 mt-8 mb-4">
        Tailnet Apps
      </h2>
      <ServiceGrid services={privateApps} columns={4} />
    </Layout>
  );
}

export default App;
