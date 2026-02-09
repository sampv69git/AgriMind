import { Leaf, TrendingUp, Droplets, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CropCardProps {
  name: string;
  season: string;
  yield: string;
  profitability: number;
  waterNeeds: string;
  sunlight: string;
  sustainability: number;
  image?: string;
}

const CropCard = ({
  name,
  season,
  yield: cropYield,
  profitability,
  waterNeeds,
  sunlight,
  sustainability,
}: CropCardProps) => {
  return (
    <Card className="group relative overflow-hidden glass-effect hover:shadow-glow transition-smooth cursor-pointer hover:-translate-y-2">
      <div className="absolute inset-0 gradient-hero opacity-0 group-hover:opacity-10 transition-smooth" />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
            <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
              {season}
            </Badge>
          </div>
          <div className="p-3 rounded-xl gradient-hero text-white">
            <Leaf className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expected Yield</span>
            <span className="font-semibold text-foreground">{cropYield}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profitability</span>
              <span className="font-semibold text-primary">{profitability}%</span>
            </div>
            <Progress value={profitability} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sustainability</span>
              <span className="font-semibold text-accent">{sustainability}%</span>
            </div>
            <Progress value={sustainability} className="h-2 [&>div]:bg-accent" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">{waterNeeds}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">{sunlight}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CropCard;
