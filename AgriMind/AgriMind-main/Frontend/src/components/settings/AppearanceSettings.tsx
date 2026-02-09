import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Laptop } from "lucide-react";

type Theme = "light" | "dark" | "system";

const AppearanceSettings = () => {
  // Initialize theme from localStorage or default to 'system'
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );
  
  // Effect to apply the theme class to the <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>
      <div className="space-y-4">
        <div>
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["light", "dark", "system"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === t ? "border-primary" : "border-border"
                }`}
              >
                {t === "light" && <Sun className="h-6 w-6" />}
                {t === "dark" && <Moon className="h-6 w-6" />}
                {t === "system" && <Laptop className="h-6 w-6" />}
                <span className="text-sm capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Language selector removed per request */}
      </div>
    </div>
  );
};

export default AppearanceSettings;
