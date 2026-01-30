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
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = (lat: number, lon: number) => {
      fetch(`/api/weather?lat=${lat}&lon=${lon}`)
        .then((response) => response.json())
        .then((data) => setWeather(data));
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Fallback to Atlanta
        fetchWeather(33.749, -84.388);
      },
    );
  }, []);

  if (!weather) {
    return <div>Loading weather...</div>;
  }

  return (
    <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
      <div className="flex items-center gap-4">
        {getWeatherIcon(weather.shortForecast, "w-12 h-12 text-zinc-300")}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light">{weather.temperature}°</span>
            <span className="text-zinc-500">{weather.temperatureUnit}</span>
          </div>
          <div className="text-zinc-400">{weather.shortForecast}</div>
        </div>
      </div>
    </div>
  );
}
