import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SpeechStatus = "idle" | "recording" | "processing" | "unsupported" | "error";

export interface UseSpeechRecognitionOptions {
  lang?: string; // BCP-47 tag, e.g., "en-US", "hi-IN"
  interimResults?: boolean;
  continuous?: boolean;
  timeoutMs?: number; // auto-stop after this duration
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang, interimResults = true, continuous = false, timeoutMs } = options;
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const recordingRequestedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const supported = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }, []);

  useEffect(() => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    const SpeechRecognitionCtor: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang || navigator.language || "en-US";
    recognition.interimResults = interimResults;
    recognition.continuous = continuous;

    recognition.onstart = () => {
      setStatus("recording");
      setError(null);
      setTranscript("");
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (timeoutMs && timeoutMs > 0) {
        timeoutRef.current = window.setTimeout(() => {
          try { recognition.stop(); } catch {}
          recordingRequestedRef.current = false;
        }, timeoutMs);
      }
    };

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text.trim());
    };

    recognition.onerror = (event: any) => {
      setError(event.error || "speech_recognition_error");
      setStatus("error");
    };

    recognition.onend = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (recordingRequestedRef.current && continuous) {
        // Auto-restart session for continuous dictation on browsers that stop frequently
        try { recognition.start(); return; } catch {}
      }
      setStatus("idle");
    };

    recognitionRef.current = recognition;
    return () => {
      try { recognition.stop(); } catch {}
      recognitionRef.current = null;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported, lang, interimResults, continuous]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setError(null);
      recordingRequestedRef.current = true;
      recognitionRef.current.start();
    } catch {}
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recordingRequestedRef.current = false;
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch {}
  }, []);

  const abort = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recordingRequestedRef.current = false;
      if (recognitionRef.current.abort) recognitionRef.current.abort();
      else recognitionRef.current.stop();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setStatus("idle");
    } catch {}
  }, []);

  return { status, transcript, error, start, stop, abort, supported: !!supported };
}
