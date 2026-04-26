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
      <div className="p-4 rounded-xl bg-white/5 border border-rose-400/20 text-zinc-400">
        {error}
      </div>
    );
  }

  if (!weather) {
    return <div>Loading weather...</div>;
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-rose-400/20">
      <div className="flex items-center gap-4">
        {getWeatherIcon(weather.shortForecast, "w-12 h-12 text-zinc-300")}
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
