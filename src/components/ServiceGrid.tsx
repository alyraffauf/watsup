import { useEffect, useState } from "react";
import { Circle, CircleCheck, CircleX } from "lucide-react";
import type { Service } from "../types";

type Props = {
  services: Service[];
  columns?: 1 | 2 | 3 | 4;
  refreshInterval?: number;
};

export default function ServiceGrid({
  services,
  columns = 4,
  refreshInterval = 20000,
}: Props) {
  const [statuses, setStatuses] = useState<Record<string, boolean | null>>({});

  useEffect(() => {
    const fetchStatuses = () => {
      fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(services),
      })
        .then((response) => response.json())
        .then((data) => {
          setStatuses(data);
        });
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, refreshInterval);

    return () => clearInterval(interval);
  }, [services, refreshInterval]);

  const gridCols = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {services.map((service) => (
        <a
          key={service.name}
          href={service.url}
          className="block p-4 rounded-xl bg-white/5 border border-rose-400/20 hover:border-rose-400/40 hover:scale-105 transition-all"
        >
          <div className="flex items-center gap-3">
            {service.icon && (
              <img src={service.icon} alt="" className="w-6 h-6 shrink-0" />
            )}
            <h3 className="text-md font-semibold flex-1 truncate">
              {service.name}
            </h3>
            <span className="shrink-0">
              {statuses[service.name] == null && (
                <Circle className="text-zinc-500" />
              )}
              {statuses[service.name] === true && (
                <CircleCheck className="text-emerald-400" />
              )}
              {statuses[service.name] === false && (
                <CircleX className="text-rose-400" />
              )}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
