import React, { useCallback, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, Square } from "lucide-react";

// Simple command grammar
// Examples users can say:
// - "go home", "open recommender", "open yield predictor"
// - "open settings", "open equipment", "open community"
// - "show weather", "scroll to soil", "go to market", "more features"
// - "back", "forward", "refresh page"
// - "scroll up", "scroll down", "top", "bottom", "help"

const COMMAND_ALIASES: Record<string, string> = {
  // routes
  home: "/",
  "home page": "/",
  dashboard: "/",
  recommender: "/crop-recommender",
  "crop recommender": "/crop-recommender",
  "recommend": "/crop-recommender",
  "yield": "/yield-predictor",
  "yield predictor": "/yield-predictor",
  "predict yield": "/yield-predictor",
  settings: "/settings",
  preferences: "/settings",
  equipment: "/equipment",
  community: "/community",
};

const SECTION_IDS = ["weather", "soil", "market", "more-features"] as const;

type SectionId = typeof SECTION_IDS[number];

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export default function VoiceAssistantButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState<string>("");
  // Use any to avoid requiring lib.dom SpeechRecognition types
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionImpl: any = useMemo(() => {
    const w = window as any;
    return (
      w.SpeechRecognition ||
      w.webkitSpeechRecognition ||
      w.mozSpeechRecognition ||
      w.msSpeechRecognition ||
      null
    );
  }, []);

  const scrollToSection = useCallback((id: SectionId) => {
    // Ensure we are on home first; then scroll
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      // allow page to render before scrolling
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.pathname, navigate]);

  const handleResult = useCallback((spoken: string) => {
    const text = normalize(spoken);
    setMessage(`Heard: "${text}"`);

    // Global page controls first
    if (/^(back|go back|previous page)/.test(text)) {
      window.history.back();
      return;
    }
    if (/^(forward|next page)/.test(text)) {
      window.history.forward();
      return;
    }
    if (/(refresh|reload)( the)? page/.test(text)) {
      window.location.reload();
      return;
    }

    if (/(scroll up|page up)/.test(text)) {
      window.scrollBy({ top: -Math.round(window.innerHeight * 0.8), behavior: "smooth" });
      return;
    }
    if (/(scroll down|page down)/.test(text)) {
      window.scrollBy({ top: Math.round(window.innerHeight * 0.8), behavior: "smooth" });
      return;
    }
    if (/^(top|go to top|back to top)/.test(text)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (/^(bottom|go to bottom|end of page)/.test(text)) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }

    if (/^(help|what can you do|commands)/.test(text)) {
      setMessage(
        "Try: home, recommender, yield predictor, settings, equipment, community, weather, soil, market, more features, back, forward, refresh, scroll up/down, top, bottom."
      );
      return;
    }

    // Route commands
    // 1) Navigate routes
    for (const [key, path] of Object.entries(COMMAND_ALIASES)) {
      if (text.includes(key)) {
        navigate(path);
        return;
      }
    }

    // 2) Scroll to sections on home
    for (const id of SECTION_IDS) {
      if (text.includes(id) || text.includes(id.replace("-", " ")) ||
          (id === "more-features" && (text.includes("more features") || text.includes("explore"))) ||
          (id === "weather" && (text.includes("weather forecast") || text.includes("weather section")))) {
        scrollToSection(id);
        return;
      }
    }

    // 3) Common phrasings
    if (/(go|navigate) to home|home page/.test(text)) return navigate("/");
    if (/weather/.test(text)) return scrollToSection("weather");
    if (/soil/.test(text)) return scrollToSection("soil");
    if (/market/.test(text)) return scrollToSection("market");
    if (/more features|explore/.test(text)) return scrollToSection("more-features");

    setMessage("Sorry, I didn't catch a supported command.");
  }, [navigate, scrollToSection]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionImpl) {
      setMessage("Voice not supported in this browser.");
      return;
    }

    try {
      const rec: any = new (SpeechRecognitionImpl as any)();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map(r => r[0]?.transcript || "")
          .join(" ");
        if (transcript) handleResult(transcript);
      };

      rec.onerror = () => setMessage("Voice recognition error.");
      rec.onend = () => setListening(false);

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
      setMessage("Listening… say things like: 'open recommender', 'weather', 'go to market'.");
    } catch (e) {
      setMessage("Unable to start voice recognition.");
    }
  }, [SpeechRecognitionImpl, handleResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 60 }}>
      <button
        aria-label={listening ? "Stop voice assistant" : "Start voice assistant"}
        onClick={listening ? stopListening : startListening}
        className={`rounded-full shadow-lg p-4 transition-transform focus:outline-none focus:ring-2 focus:ring-primary ${
          listening ? "bg-red-600 text-white" : "bg-primary text-white"
        }`}
      >
        {listening ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>
      {message && (
        <div className="mt-2 text-xs bg-background/90 border border-border rounded-md px-3 py-2 shadow-md max-w-[240px]">
          {message}
        </div>
      )}
    </div>
  );
}
