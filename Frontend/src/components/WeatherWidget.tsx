import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type WeatherResponse = {
  current: {
    Temperature: number | null;
    Humidity: number | null;
    Rainfall: number | null;
    WindSpeed: number | null;
  };
  forecast_5day: {
    Time: string[];
    Temp_Max: number[];
    Temp_Min: number[];
    Rainfall_Sum: number[];
    WindSpeed_Max: number[];
  };
};

const WeatherWidget = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [lat, setLat] = useState<number>(18.5204); // Pune default
  const [lon, setLon] = useState<number>(73.8567);

  const apiBase = useMemo(() => {
    const base = import.meta.env.VITE_API_URL as string | undefined;
    return base ? base.replace(/\/$/, "") : "";
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/weather`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API error ${res.status}: ${txt}`);
      }
      const json = (await res.json()) as WeatherResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to use browser geolocation once on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
        },
        () => {
          // ignore errors, keep defaults
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const currentTemp = data?.current.Temperature ?? null;
  const currentHumidity = data?.current.Humidity ?? null;
  const currentRain = data?.current.Rainfall ?? null;
  const currentWind = data?.current.WindSpeed ?? null;

  const forecast = useMemo(() => {
    if (!data) return [] as { day: string; temp: number; icon: any }[];
    const { Time, Temp_Max } = data.forecast_5day;
    return Time.map((t, i) => ({
      day: new Date(t).toLocaleDateString(undefined, { weekday: "short" }),
      temp: Math.round(Temp_Max[i] ?? 0),
      icon: (Temp_Max[i] ?? 0) > 29 ? Sun : (Temp_Max[i] ?? 0) > 26 ? Cloud : CloudRain,
    })).slice(0, 5);
  }, [data]);

  return (
    <Card className="glass-effect shadow-glow p-6">
      <div className="mb-4 flex flex-col md:flex-row md:items-end gap-3">
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value))}
              className="px-3 py-2 rounded-md border border-border bg-background"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(parseFloat(e.target.value))}
              className="px-3 py-2 rounded-md border border-border bg-background"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchWeather} disabled={loading}>
            {loading ? "Loading..." : "Fetch Weather"}
          </Button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {currentTemp !== null ? `${Math.round(currentTemp)}°C` : "—"}
            </h3>
            <p className="text-muted-foreground">Real-time conditions</p>
          </div>
          <div className="p-4 rounded-2xl gradient-sky">
            <Cloud className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs text-muted-foreground">Humidity</span>
            <span className="text-sm font-semibold">{currentHumidity ?? "—"}%</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Wind className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Wind</span>
            <span className="text-sm font-semibold">{currentWind ?? "—"} km/h</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <CloudRain className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs text-muted-foreground">Rain</span>
            <span className="text-sm font-semibold">{currentRain ?? "—"} mm</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold mb-3">5-Day Forecast</h4>
        <div className="grid grid-cols-5 gap-2">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
            >
              <span className="text-xs font-medium mb-2">{day.day}</span>
              <day.icon className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-semibold">{day.temp}°</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
