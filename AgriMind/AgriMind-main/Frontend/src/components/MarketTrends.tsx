import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MarketTrends = () => {
  const markets = [
    { crop: "Rice", price: "₹2,450", change: 12.5, trend: "up", demand: "High" },
    { crop: "Wheat", price: "₹2,100", change: 8.2, trend: "up", demand: "High" },
    { crop: "Cotton", price: "₹6,800", change: -3.5, trend: "down", demand: "Medium" },
    { crop: "Sugarcane", price: "₹320", change: 0, trend: "stable", demand: "Medium" },
    { crop: "Maize", price: "₹1,850", change: 15.3, trend: "up", demand: "High" },
    { crop: "Pulses", price: "₹7,200", change: 5.8, trend: "up", demand: "Very High" },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "Very High":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "High":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <Card className="glass-effect shadow-glow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Market Trends</h3>
          <p className="text-sm text-muted-foreground">Live pricing & demand analysis</p>
        </div>
      </div>

      <div className="space-y-3">
        {markets.map((market, index) => (
          <div
            key={index}
            className="group flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-foreground">{market.crop}</h4>
                <Badge className={getDemandColor(market.demand)}>
                  {market.demand}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-primary">{market.price}</p>
              <p className="text-xs text-muted-foreground">per quintal</p>
            </div>
            
            <div className={`flex items-center gap-2 ${getTrendColor(market.trend)}`}>
              {getTrendIcon(market.trend)}
              <span className="font-semibold">
                {market.change > 0 ? "+" : ""}{market.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-accent">Market Insight:</span> Pulses and Maize showing strong upward trends. Consider planting these crops for maximum profitability this season.
        </p>
      </div>
    </Card>
  );
};

export default MarketTrends;
