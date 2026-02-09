import { Sprout, CloudRain, TrendingUp, BookOpen, Settings, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FloatingToolbar = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: Sprout,
      label: "Crop Recommendations",
      action: () => document.getElementById("trending-crops")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      icon: CloudRain,
      label: "Weather Forecast",
      action: () => document.getElementById("weather")?.scrollIntoView({ behavior: "smooth" }),
    },
    
    {
      icon: Map,
      label: "Soil Analysis",
      action: () => document.getElementById("soil")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      icon: TrendingUp,
      label: "Market Trends",
      action: () => document.getElementById("market")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      icon: BookOpen,
      label: "More Features",
      action: () =>document.getElementById("more-features")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      icon: Settings,
      label: "Settings",
      action: () => navigate("/settings"), // Proper route to Settings page
    },
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex">
        <motion.div
          className="glass-effect rounded-2xl p-2 shadow-elevated flex gap-3"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {tools.map((tool, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={tool.action}
                    className="w-12 h-12 hover:bg-primary/20 hover:text-primary transition-all duration-300"
                  >
                    <tool.icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-card border border-border">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default FloatingToolbar;
