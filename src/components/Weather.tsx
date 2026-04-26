import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudSun,
  CloudMoon,
} from "lucide-react";

function getWeatherIcon(forecast: string, className?: string) {
  const f = forecast.toLowerCase();
  if (f.includes("thunder") || f.includes("lightning"))
    return <CloudLightning className={className} />;
  if (f.includes("snow") || f.includes("flurr"))
    return <CloudSnow className={className} />;
  if (f.includes("rain") || f.includes("shower") || f.includes("drizzle"))
    return <CloudRain className={className} />;
  if (f.includes("fog") || f.includes("mist") || f.includes("haze"))
    return <CloudFog className={className} />;
  if (f.includes("partly cloudy")) return <CloudSun className={className} />;
  if (
    f.includes("mostly cloudy") ||
    f.includes("cloud") ||
    f.includes("overcast")
  )
    return <Cloud className={className} />;
  if (f.includes("sunny") || f.includes("clear"))
    return <Sun className={className} />;
  return <Sun className={className} />;
}

function getWeatherTheme(forecast: string) {
  const f = forecast.toLowerCase();
  if (f.includes("thunder") || f.includes("lightning"))
    return { tint: "from-purple-500/20", icon: "text-purple-300" };
  if (f.includes("snow") || f.includes("flurr"))
    return { tint: "from-cyan-300/20", icon: "text-cyan-200" };
  if (f.includes("rain") || f.includes("shower") || f.includes("drizzle"))
    return { tint: "from-blue-500/20", icon: "text-blue-300" };
  if (f.includes("fog") || f.includes("mist") || f.includes("haze"))
    return { tint: "from-slate-400/15", icon: "text-slate-300" };
  if (f.includes("partly cloudy"))
    return { tint: "from-amber-400/15", icon: "text-amber-200" };
  if (
    f.includes("mostly cloudy") ||
    f.includes("cloud") ||
    f.includes("overcast")
  )
    return { tint: "from-zinc-400/10", icon: "text-zinc-300" };
  if (f.includes("sunny") || f.includes("clear"))
    return { tint: "from-amber-500/20", icon: "text-amber-300" };
  return { tint: "from-amber-500/20", icon: "text-amber-300" };
}

export function Weather() {
  const [weather, setWeather] = useState<{
    temperature: number;
    temperatureUnit: string;
    shortForecast: string;
    city: string;
    state: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/weather`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setWeather(data);
        }
      })
      .catch(() => setError("Failed to load weather"));
  }, []);

  if (error) {
    return (
      <div className="card p-4 text-zinc-400">
        {error}
      </div>
    );
  }

  if (!weather) {
    return <div>Loading weather...</div>;
  }

  const theme = getWeatherTheme(weather.shortForecast);

  return (
    <div className="card p-4 relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.tint} to-transparent pointer-events-none`}
      />
      <div className="relative flex items-center gap-4">
        {getWeatherIcon(weather.shortForecast, `w-12 h-12 ${theme.icon}`)}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light">{weather.temperature}°</span>
            <span className="text-zinc-500">{weather.temperatureUnit}</span>
          </div>
          <div className="text-zinc-400">{weather.shortForecast}</div>
          <div className="text-zinc-400">
            {weather.city}, {weather.state}
          </div>
        </div>
      </div>
    </div>
  );
}
