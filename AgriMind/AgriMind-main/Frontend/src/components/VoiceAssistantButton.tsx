import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  const [micPermission, setMicPermission] = useState<'granted'|'denied'|'prompt'|'unknown'>('unknown');
  const [isBrave, setIsBrave] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // Use any to avoid requiring lib.dom SpeechRecognition types
  const recognitionRef = useRef<any>(null);
  const keepListeningRef = useRef(false);
  const restartingRef = useRef(false);

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

  useEffect(() => {
    // Detect Brave browser where possible
    try {
      const navAny = (navigator as any);
      if (navAny.brave && typeof navAny.brave.isBrave === 'function') {
        navAny.brave.isBrave().then((b: boolean) => setIsBrave(Boolean(b))).catch(() => {});
      } else if (/Brave\//i.test(navigator.userAgent)) {
        setIsBrave(true);
      }
    } catch {}

    // Check microphone permission state if supported
    (async () => {
      try {
        if ((navigator as any).permissions && (navigator as any).permissions.query) {
          const res = await (navigator as any).permissions.query({ name: 'microphone' as any });
          const state = res.state || 'prompt';
          setMicPermission(state as any);
          // listen for changes
          try { res.onchange = () => setMicPermission(res.state as any); } catch {}
        } else {
          setMicPermission('unknown');
        }
      } catch (e) {
        setMicPermission('unknown');
      }
    })();
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
        // If the user asked for home but is already on home, scroll to top instead
        if (path === "/" && location.pathname === "/") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
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
    if (/(go|navigate) to home|home page/.test(text)) {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      return navigate("/");
    }
    if (/weather/.test(text)) return scrollToSection("weather");
    if (/soil/.test(text)) return scrollToSection("soil");
    if (/market/.test(text)) return scrollToSection("market");
    if (/more features|explore/.test(text)) return scrollToSection("more-features");

    setMessage("Sorry, I didn't catch a supported command.");
  }, [navigate, scrollToSection]);

  const startListening = useCallback(async () => {
    if (!SpeechRecognitionImpl) {
      setMessage("Voice not supported in this browser.");
      return;
    }

    try {
      // If permissions API reports denied, show a helpful message
      if (micPermission === 'denied') {
        setMessage(
          isBrave
            ? 'Microphone blocked. Disable Brave Shields or allow Microphone in site settings.'
            : 'Microphone blocked. Please allow microphone access for this site.'
        );
        return;
      }

      // Prompt for microphone access before starting recognition to get clearer errors
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await (navigator.mediaDevices as any).getUserMedia({ audio: true });
          try { stream.getTracks().forEach((t: any) => t.stop()); } catch {}
        } catch (err: any) {
          // If Brave shields block getUserMedia, provide actionable advice
          if (isBrave) {
            setMessage('Microphone permission denied or blocked by Brave Shields. Try disabling Shields for this site.');
          } else {
            setMessage('Microphone permission denied. Please allow microphone access.');
          }
          return;
        }
      }

      const rec: any = new (SpeechRecognitionImpl as any)();
      rec.lang = "en-US";
      // Keep continuous listening so the assistant stays active until user stops it
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setListening(true);
        setMessage("Listening… say things like: 'open recommender', 'weather', 'go to market'.");
      };

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0]?.transcript || "")
          .join(" ");
        if (transcript) handleResult(transcript);
      };

      rec.onerror = (event: any) => {
        const err = event?.error || event?.message || 'speech_recognition_error';
        // Friendly mapping
        let msg = 'Voice recognition error.';
        if (err === 'not-allowed' || err === 'permission-denied') msg = 'Microphone permission denied.';
        else if (err === 'no-speech') msg = 'No speech detected. Try speaking clearly.';
        else if (typeof err === 'string') msg = err;
        setMessage(msg);
        setListening(false);
        // Try to restart only if user explicitly wants continuous listening and we're not already restarting
        if (keepListeningRef.current && !restartingRef.current) {
          restartingRef.current = true;
          setTimeout(() => {
            try {
              if (recognitionRef.current && keepListeningRef.current) {
                recognitionRef.current.start();
                setListening(true);
                setMessage('Listening...');
              }
            } catch (e) {
              console.error('restart after error failed', e);
            } finally {
              restartingRef.current = false;
            }
          }, 600);
        }
      };

      rec.onend = () => {
        setListening(false);
        if (keepListeningRef.current && !restartingRef.current) {
          restartingRef.current = true;
          setTimeout(() => {
            try {
              if (recognitionRef.current && keepListeningRef.current) {
                recognitionRef.current.start();
                setListening(true);
                setMessage('Listening...');
              }
            } catch (e) {
              console.error('auto-restart failed', e);
            } finally {
              restartingRef.current = false;
            }
          }, 600);
        }
      };

      recognitionRef.current = rec;
      keepListeningRef.current = true;
      restartingRef.current = false;
      try {
        rec.start();
      } catch (e) {
        // some browsers may throw if start called too quickly; report error
        console.error('rec.start error', e);
        setMessage('Unable to start voice recognition.');
        keepListeningRef.current = false;
        recognitionRef.current = null;
      }
    } catch (e) {
      console.error('startListening error', e);
      setMessage("Unable to start voice recognition.");
    }
  }, [SpeechRecognitionImpl, handleResult]);

  const stopListening = useCallback(() => {
    // Stop and prevent auto-restart
    keepListeningRef.current = false;
    restartingRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
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
      <div className="mt-2 flex items-start gap-2">
        <button
          onClick={() => setShowHelp(v => !v)}
          className="text-xs text-primary underline"
          aria-expanded={showHelp}
        >
          {showHelp ? 'Hide help' : 'Help'}
        </button>
        {showHelp && (
          <div className="text-xs bg-background/95 border border-border rounded-md px-3 py-2 shadow-md max-w-[320px]">
            <div className="font-semibold mb-1">Voice Troubleshooting</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>Ensure the browser asks for microphone access and you click <strong>Allow</strong>.</li>
              <li>If using Brave: click the Brave lion (Shields) in the address bar and turn <strong>Shields down</strong> for this site.</li>
              <li>Check site Microphone permission: address bar → Site settings → Microphone → <strong>Allow</strong>.</li>
              <li>Try in Chrome/Edge if problems persist — they have the most stable SpeechRecognition support.</li>
              <li>Use the text input in the Voice Assistant dialog as a fallback.</li>
            </ul>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" onClick={() => setShowHelp(false)}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
