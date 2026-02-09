import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Loader2, Mic, Square, Send } from "lucide-react";

type ReplyMode = "same";

interface VoiceAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// backend URL from env (works for localhost + deployment)
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VoiceAssistant({
  open,
  onOpenChange,
}: VoiceAssistantProps) {
  const [replyMode, setReplyMode] = useState<ReplyMode>("same");
  const [inputLang, setInputLang] = useState<string>(
    navigator.language || "en-US"
  );
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const { status, transcript, error, start, stop, abort, supported } =
    useSpeechRecognition({
      interimResults: true,
      continuous: true,
      timeoutMs: 10000,
      lang: inputLang,
    });

  // speech → textarea (live)
  useEffect(() => {
    if (transcript && status === "recording") {
      setQuestion(transcript);
    }
  }, [transcript, status]);

  const ask = async () => {
    const q = question.trim();
    if (!q) return;

    try {
      setLoading(true);
      setAnswer("");

      if (status === "recording") stop();

      const res = await fetch(`${API_BASE}/api/agribot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: q,
          replyMode,
          userLang: inputLang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "AgriBot failed");
      }

      setAnswer(data.answer || "No response from AgriBot");
    } catch (e: any) {
      setAnswer(e?.message || "Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    stop();
    setQuestion("");
    setAnswer("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Voice Assistant</DialogTitle>
          <DialogDescription>
            Ask agriculture-related questions by voice or text.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            {/* ✅ Reply language — ONLY SAME AS QUESTION */}
            <div>
              <Label>Reply language</Label>
              <Select
                value={replyMode}
                onValueChange={(v: ReplyMode) => setReplyMode(v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Same as question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input language */}
            <div>
              <Label>Input language</Label>
              <Select
                value={inputLang}
                onValueChange={(v: string) => setInputLang(v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-IN">English (India)</SelectItem>
                  <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                  <SelectItem value="kn-IN">Kannada (India)</SelectItem>
                  <SelectItem value="te-IN">Telugu (India)</SelectItem>
                  <SelectItem value="ta-IN">Tamil (India)</SelectItem>
                  <SelectItem value="mr-IN">Marathi (India)</SelectItem>
                  <SelectItem value="bn-IN">Bengali (India)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Record buttons */}
            <div className="flex items-center gap-2 sm:col-span-2">
              {supported ? (
                status === "recording" ? (
                  <>
                    <Button variant="destructive" onClick={stop}>
                      <Square className="h-4 w-4 mr-1" /> Stop
                    </Button>
                    <Button variant="outline" onClick={abort}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={start}>
                    <Mic className="h-4 w-4 mr-1" /> Record
                  </Button>
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  Voice input not supported in this browser
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600">{String(error)}</div>
          )}

          <div>
            <Label>Your question</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Speak or type your question..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={ask}
              disabled={loading || !question.trim()}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Ask
            </Button>
          </div>

          {!!answer && (
            <div>
              <Label>Answer</Label>
              <div className="border rounded-md p-3 text-sm whitespace-pre-wrap max-h-72 overflow-auto">
                {answer}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
