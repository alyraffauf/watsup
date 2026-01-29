import { useState, useEffect } from "react";

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
    <div className="block p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
      <div>
        {weather.temperature}°{weather.temperatureUnit}
      </div>
      <div>{weather.shortForecast}</div>
    </div>
  );
}
