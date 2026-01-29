import Layout from "./Layout";
import ServiceGrid from "./components/ServiceGrid";
import { apps } from "./data/apps";
import { privateApps } from "./data/privateApps";
import { websites } from "./data/websites";

export function App() {
  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-zinc-400 mt-8 mb-4">
        Websites
      </h2>
      <ServiceGrid services={websites} columns={2} />
      <h2 className="text-2xl font-semibold text-zinc-400 mt-8 mb-4">
        Public Apps
      </h2>
      <ServiceGrid services={apps} columns={4} />
      <h2 className="text-2xl font-semibold text-zinc-400 mt-8 mb-4">
        Tailnet Apps
      </h2>
      <ServiceGrid services={privateApps} columns={4} />
    </Layout>
  );
}

export default App;
