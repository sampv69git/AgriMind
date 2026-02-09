import { Sprout, Settings, Activity, Leaf, Bot } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import VoiceAssistant from "./VoiceAssistant";
import { motion } from "framer-motion";

export const NavBar = () => {
  const location = useLocation();
  const { isAuthenticated, loading, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [voiceOpen, setVoiceOpen] = useState(false);

  const navLinks = [
    { to: "/crop-recommender", label: "Recommender", icon: Leaf },
    { to: "/yield-predictor", label: "Yield Predictor", icon: Activity },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleBrandClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Removed auto-open behavior; login is now optional and user-triggered via button

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Gooey effect container */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="gooey-bg" />
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                className="particle"
                animate={{
                  x: Math.sin(i) * 60,
                  y: Math.cos(i) * 60,
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          {/* Brand */}
          <Link
            to="/"
            onClick={handleBrandClick}
            className="flex items-center gap-2 relative z-10"
          >
            <Sprout className="h-7 w-7 text-primary drop-shadow-md" />
            <span className="text-xl font-bold text-foreground">AgriMind</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-3 relative z-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`
                }
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Voice + Auth Buttons */}
<div className="flex items-center gap-6 relative z-10">
  <Button
    variant="ghost"
    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
    aria-label="Open voice assistant"
    onClick={() => setVoiceOpen(true)}
  >
    <Bot className="h-6 w-6" />
    <span>AgriBot</span>
  </Button>

  {isAuthenticated ? (
    <Button
      variant="outline"
      className="font-semibold hover:bg-red-50 hover:text-red-600 transition-colors"
      onClick={logout}
    >
      Logout
    </Button>
  ) : (
    <>
      <Button
        variant="ghost"
        className="font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
        onClick={() => handleAuthClick("login")}
      >
        Login
      </Button>
      <Button
        variant="default"
        className="font-semibold bg-primary text-white hover:bg-primary/90 transition-all duration-300"
        onClick={() => handleAuthClick("register")}
      >
        Register
      </Button>
    </>
  )}
</div>

        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authMode}
      />

      <VoiceAssistant open={voiceOpen} onOpenChange={setVoiceOpen} />

      {/* Extra Gooey CSS */}
      <style>{`
        .gooey-bg {
          position: absolute;
          inset: 0;
          filter: url(#gooey);
        }

        .particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(34,197,94,0.5);
          filter: blur(8px);
        }

        @media (max-width: 768px) {
          nav {
            display: none;
          }
        }
      `}</style>

      {/* SVG Filter for Gooey Effect */}
      <svg style={{ display: "none" }}>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="gooey"
          />
          <feBlend in="SourceGraphic" in2="gooey" />
        </filter>
      </svg>
    </>
  );
};

export default NavBar;
