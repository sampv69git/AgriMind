import { useEffect, useState } from "react";

const ScrollIndicator = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    { label: "Home", progress: 0 },
    { label: "Crops", progress: 20 },
    { label: "Weather", progress: 40 },
    { label: "Soil", progress: 60 },
    { label: "Market", progress: 80 },
  ];

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3">
      <div className="glass-effect rounded-full px-3 py-4 shadow-elevated animate-slide-up">
        <div className="relative h-48 w-1 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary via-primary-glow to-accent rounded-full transition-all duration-300"
            style={{ height: `${scrollProgress}%` }}
          />
          {sections.map((section, index) => (
            <div
              key={index}
              className="absolute inset-x-0 w-3 h-3 -left-1 bg-card border-2 border-primary rounded-full transition-all duration-300"
              style={{
                top: `${section.progress}%`,
                opacity: scrollProgress >= section.progress ? 1 : 0.3,
                transform: scrollProgress >= section.progress ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
      <div className="glass-effect rounded-lg px-3 py-2 text-xs font-medium">
        {Math.round(scrollProgress)}%
      </div>
    </div>
  );
};

export default ScrollIndicator;
