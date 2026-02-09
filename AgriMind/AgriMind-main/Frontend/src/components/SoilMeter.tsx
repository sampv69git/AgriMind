import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TestTube, Leaf } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SoilResponse = {
  N: number | null;
  P: number | null;
  K: number | null;
  pH: number | null;
  source?: string;
};

const SoilMeter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soil, setSoil] = useState<SoilResponse | null>(null);
  const [lat, setLat] = useState<number>(18.5204);
  const [lon, setLon] = useState<number>(73.8567);

  const apiBase = useMemo(() => {
    const base = import.meta.env.VITE_API_URL as string | undefined;
    return base ? base.replace(/\/$/, "") : "";
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/api/soil`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lon }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`API error ${res.status}: ${txt}`);
        }
        const json = (await res.json()) as SoilResponse;
        setSoil(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch soil data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [apiBase, lat, lon]);

  // Ranges used to compute a simple progress percentage
  const ranges = {
    pH: { min: 6.0, max: 7.0 },
    N: { min: 80, max: 100 },
    P: { min: 60, max: 80 },
    K: { min: 60, max: 80 },
  } as const;

  const clampPct = (val: number | null, min: number, max: number) => {
    if (val == null || Number.isNaN(val)) return 0;
    if (val <= min) return 0;
    if (val >= max) return 100;
    return Math.round(((val - min) / (max - min)) * 100);
  };

  const items = [
    {
      label: "pH Level",
      value: soil?.pH ?? null,
      optimal: `${ranges.pH.min}-${ranges.pH.max}`,
      color: "text-green-500",
      progress: clampPct(soil?.pH ?? null, ranges.pH.min, ranges.pH.max),
    },
    {
      label: "Nitrogen (N)",
      value: soil?.N ?? null,
      optimal: `${ranges.N.min}-${ranges.N.max}`,
      color: "text-blue-500",
      progress: clampPct(soil?.N ?? null, ranges.N.min, ranges.N.max),
    },
    {
      label: "Phosphorus (P)",
      value: soil?.P ?? null,
      optimal: `${ranges.P.min}-${ranges.P.max}`,
      color: "text-purple-500",
      progress: clampPct(soil?.P ?? null, ranges.P.min, ranges.P.max),
    },
    {
      label: "Potassium (K)",
      value: soil?.K ?? null,
      optimal: `${ranges.K.min}-${ranges.K.max}`,
      color: "text-orange-500",
      progress: clampPct(soil?.K ?? null, ranges.K.min, ranges.K.max),
    },
  ];

  return (
    <Card className="glass-effect shadow-glow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl gradient-earth text-white">
          <TestTube className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Soil Health Analysis</h3>
          <p className="text-sm text-muted-foreground">Real-time soil composition data</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="group p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${item.color}`}>{item.label}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground">
                  {item.value == null ? (loading ? "Loading..." : "—") : item.value}
                </span>
                <span className="text-xs text-muted-foreground ml-2">({item.optimal})</span>
              </div>
            </div>
            <Progress value={item.progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Leaf className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Overall Health</h4>
            <p className="text-sm text-muted-foreground">
              {soil?.source === "SOILGRIDS" ? "Values based on SoilGrids data (0–5 cm)." : "Using fallback estimates."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SoilMeter;
