import { useState, useEffect } from "react";
import { Sprout, ChevronDown, Sparkles, Tractor, Users, Activity, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingToolbar from "@/components/FloatingToolbar";
import ScrollIndicator from "@/components/ScrollIndicator";
import CropCard from "@/components/CropCard";
import SoilMeter from "@/components/SoilMeter";
import MarketTrends from "@/components/MarketTrends";
import { Link } from "react-router-dom";
import WeatherWidget from "@/components/WeatherWidget"; // 1. Re-import WeatherWidget

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const recommendedCrops = [
    { name: "Rice", season: "Kharif Season", yield: "4.5 tons/hectare", profitability: 85, waterNeeds: "High", sunlight: "Full Sun", sustainability: 78 },
    { name: "Wheat", season: "Rabi Season", yield: "3.8 tons/hectare", profitability: 82, waterNeeds: "Moderate", sunlight: "Full Sun", sustainability: 85 },
    { name: "Maize", season: "Kharif Season", yield: "5.2 tons/hectare", profitability: 88, waterNeeds: "Moderate", sunlight: "Full Sun", sustainability: 80 },
    { name: "Cotton", season: "Kharif Season", yield: "2.1 tons/hectare", profitability: 75, waterNeeds: "High", sunlight: "Full Sun", sustainability: 65 },
    { name: "Pulses", season: "Rabi Season", yield: "1.8 tons/hectare", profitability: 90, waterNeeds: "Low", sunlight: "Full Sun", sustainability: 92 },
    { name: "Sugarcane", season: "Year-round", yield: "80 tons/hectare", profitability: 78, waterNeeds: "Very High", sunlight: "Full Sun", sustainability: 60 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FloatingToolbar />
      <ScrollIndicator />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className={`relative z-10 container mx-auto px-4 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6 animate-float">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-green ">AI-Powered Agriculture</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            AgriMind
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get personalized crop recommendations based on real-time soil data, weather forecasts, 
            and market trends. Maximize yield, profitability, and sustainability.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elevated font-semibold px-8">
              <Link to="/crop-recommender">Crop Recommender</Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elevated font-semibold px-8">
              <Link to="/yield-predictor">Yield Predictor</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Crop Types", value: "30+", icon: "🌾" },
              { label: "Accuracy", value: "93%", icon: "🎯" },
              { label: "Farmers Helped", value: "100+", icon: "👨‍🌾" },
            ].map((stat, index) => (
              <div key={index} className="glass-effect rounded-2xl p-6 hover:scale-105 transition-smooth">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-dark-green mb-1">{stat.value}</div>
                <div className="text-green text-sm font-medium" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => document.getElementById('crops')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          >
            <ChevronDown className="h-8 w-8 text-white" />
          </button>
        </div>
      </section>

      {/* Crop Recommendations Section */}
      {/* 🌟 Trending On-Demand Crops */}
<section id="trending-crops" className="py-20 container mx-auto px-4">
  <div className="text-center mb-12 animate-slide-up">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
      <Sprout className="h-4 w-4" />
      <span className="text-sm font-medium">Trending Crops</span>
    </div>
    <h2 className="text-4xl font-bold text-foreground mb-4">
      Trending/On-Demand Crops
    </h2>
    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
      These crops are currently in high demand in local and global markets.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Example static cards */}
    <div className="animate-scale-in">
      <CropCard
        name="Quinoa"
        season="Rabi"
        yield="3.2 tons/hectare"
        profitability={92}
        waterNeeds="Low"
        sunlight="Full Sun"
        sustainability={88}
      />
    </div>
    <div className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
      <CropCard
        name="Chili"
        season="Kharif"
        yield="2.8 tons/hectare"
        profitability={90}
        waterNeeds="Moderate"
        sunlight="Full Sun"
        sustainability={75}
      />
    </div>
    <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
      <CropCard
        name="Tomato"
        season="All Year"
        yield="5.0 tons/hectare"
        profitability={85}
        waterNeeds="High"
        sunlight="Full Sun"
        sustainability={70}
      />
    </div>
    <div className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
      <CropCard
        name="Ginger"
        season="Rabi"
        yield="2.5 tons/hectare"
        profitability={88}
        waterNeeds="Moderate"
        sunlight="Partial Shade"
        sustainability={80}
      />
    </div>
    <div className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
      <CropCard
        name="Papaya"
        season="All Year"
        yield="12 tons/hectare"
        profitability={83}
        waterNeeds="Moderate"
        sunlight="Full Sun"
        sustainability={65}
      />
    </div>
    <div className="animate-scale-in" style={{ animationDelay: "0.5s" }}>
      <CropCard
        name="Spinach"
        season="All Year"
        yield="1.2 tons/hectare"
        profitability={78}
        waterNeeds="Low"
        sunlight="Partial Shade"
        sustainability={90}
      />
    </div>
  </div>
</section>


      {/* Weather & Conditions Section */}
<section id="weather" className="py-24 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12 animate-slide-up">
      <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
        Weather & Conditions
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Real-time weather updates and 5-day forecasts to make smarter farming decisions.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Weather Card */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer">
        <h3 className="text-2xl font-bold text-foreground mb-4">Current Weather</h3>
        <p className="text-muted-foreground mb-6">
          Check temperature, humidity, and precipitation in real-time for your farm region.
        </p>
        <div className="max-w-md mx-auto">
          <WeatherWidget />
        </div>
      </div>

      {/* Tips / Highlights Card */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer">
        <h3 className="text-2xl font-bold text-foreground mb-4">Farming Tips</h3>
        <ul className="text-muted-foreground space-y-3">
          <li>🌡️ Optimal irrigation schedule based on recent rainfall</li>
          <li>☀️ Sunlight hours forecast for crop planning</li>
          <li>💨 Wind & storm alerts for crop protection</li>
        </ul>
      </div>
    </div>
  </div>
</section>
{/* Soil Health Monitor Section */}
<section id="soil" className="py-24 bg-gradient-to-t from-green-50 to-white dark:from-gray-900 dark:to-black">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12 animate-slide-up">
      <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
        Soil Health Monitor
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Comprehensive soil analysis with real-time nutrient levels, moisture, and pH readings for smarter crop management.
      </p>
    </div>

    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Soil Metrics Card */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer">
        <h3 className="text-2xl font-bold text-foreground mb-4">Soil Nutrients</h3>
        <p className="text-muted-foreground mb-6">
          View key nutrients like Nitrogen, Phosphorus, and Potassium levels to optimize fertilization.
        </p>
        <SoilMeter />
      </div>

      {/* Crop Recommendations Card */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col">
        <h3 className="text-2xl font-bold text-foreground mb-4">Crop Recommendations</h3>
        <ul className="text-muted-foreground space-y-3 mb-6">
          <li className="flex items-center gap-2">🥦 Choose crops suited to current soil pH and moisture</li>
          <li className="flex items-center gap-2">💧 Optimize irrigation to maximize nutrient absorption</li>
          <li className="flex items-center gap-2">🌱 Improve sustainability by rotating crops effectively</li>
        </ul>

        {/* Suggested Soil Improvements */}
        <div className="mt-4 bg-green-100 dark:bg-green-900/30 p-4 rounded-xl">
          <h4 className="text-lg font-semibold text-foreground mb-3">Suggested Soil Improvements</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" /> Add organic compost to enrich soil nutrients
            </li>
            <li className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" /> Implement cover cropping to prevent soil erosion
            </li>
            <li className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-700" /> Regularly test soil pH and adjust with lime or sulfur
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>
{/* Market Trends Section */}
<section
  id="market"
  className="py-24 bg-gradient-to-t from-green-50 to-white dark:from-gray-900 dark:to-black"
>
  <div className="container mx-auto px-4">
    <div className="text-center mb-12 animate-slide-up">
      <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
        Market Intelligence
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Live market prices, demand trends, and insights to maximize your profitability.
      </p>
    </div>

    <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer">
        <h3 className="text-2xl font-bold text-foreground mb-4">Live Prices & Trends</h3>
        <p className="text-muted-foreground mb-6">
          Track real-time prices for crops and monitor market demand to make informed selling decisions.
        </p>
        <MarketTrends />
      </div>
    </div>
  </div>
</section>

{/* Explore More Features Section */}
<section
  id="more-features"
  className="py-24 bg-gradient-to-t from-white to-green-50 dark:from-gray-900 dark:to-black"
>
  <div className="container mx-auto px-4">
    <div className="text-center mb-12 animate-slide-up">
      <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
        Explore More Features
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Connect with the community, access tools, and enhance your farming experience.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Equipment Rentals Card */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-10 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center">
        <div className="bg-primary/10 p-5 rounded-full mb-5 shadow-inner">
          <Tractor className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">Equipment Rentals</h3>
        <p className="text-muted-foreground mb-8 flex-grow text-base text-center">
          Access a wide range of farming equipment. Rent tractors, plows, and harvesters from verified owners near you.
        </p>
        <Button
          asChild
          variant="outline"
          className="px-6 py-2 font-medium hover:bg-primary hover:text-white transition-all duration-300"
        >
          <Link to="/equipment">Browse Equipment</Link>
        </Button>
      </div>

      {/* Community Hub Card */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-10 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center">
        <div className="bg-primary/10 p-5 rounded-full mb-5 shadow-inner">
          <Users className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">Community Hub</h3>
        <p className="text-muted-foreground mb-8 flex-grow text-base text-center">
          Join our community forum to connect with fellow farmers, share knowledge, and get answers to your questions.
        </p>
        <Button
          asChild
          variant="outline"
          className="px-6 py-2 font-medium hover:bg-primary hover:text-white transition-all duration-300"
        >
          <Link to="/community">Join the Community</Link>
        </Button>
      </div>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="h-6 w-6 text-primary" />
                      <br></br><br></br>
            <span className="text-xl font-bold text-foreground">AgriMind</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering farmers with AI-driven insights for sustainable agriculture
          </p>
          <hr className="my-4" />
          <p className="text-muted-foreground">
            © 2025 AgriMind. All rights reserved.
          </p>
          <br></br>
        </div>
      </footer>
    </div>
  );
};

export default Index;
