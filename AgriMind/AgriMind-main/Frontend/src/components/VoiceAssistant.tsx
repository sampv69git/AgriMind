import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { getGeminiAnswer, ReplyMode } from "@/lib/gemini";
import { Loader2, Mic, Square, Send } from "lucide-react";

interface VoiceAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VoiceAssistant({ open, onOpenChange }: VoiceAssistantProps) {
  const [replyMode, setReplyMode] = useState<ReplyMode>("same");
  const [inputLang, setInputLang] = useState<string>(navigator.language || "en-US");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const { status, transcript, error, start, stop, abort, supported } = useSpeechRecognition({
    interimResults: true,
    continuous: true,
    timeoutMs: 10000,
    lang: inputLang,
  });

  // Keep textarea in sync with transcript unless user has typed.
  const effectiveQuestion = question || transcript;

  const ask = async () => {
    const q = (effectiveQuestion || "").trim();
    if (!q) return;
    try {
      setLoading(true);
      setAnswer("");
      // Ensure recording is stopped before sending
      if (status === "recording") {
        stop();
      }
      const res = await getGeminiAnswer(q, { reply: replyMode, userLang: navigator.language });
      setAnswer(res);
    } catch (e: any) {
      setAnswer(e?.message || "Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    stop();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Voice Assistant</DialogTitle>
          <DialogDescription>
            Ask agriculture-related questions by voice or text. Choose reply language below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <Label htmlFor="reply">Reply language</Label>
              <Select value={replyMode} onValueChange={(v: ReplyMode) => setReplyMode(v)}>
                <SelectTrigger id="reply" className="mt-1">
                  <SelectValue placeholder="Reply language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Same as question</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="input-lang">Input language</Label>
              <Select value={inputLang} onValueChange={(v: string) => setInputLang(v)}>
                <SelectTrigger id="input-lang" className="mt-1">
                  <SelectValue placeholder="Input language" />
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

            <div className="flex items-center gap-2 sm:col-span-2">
              {supported ? (
                status === "recording" ? (
                  <>
                    <Button variant="destructive" onClick={stop} className="gap-2">
                      <Square className="h-4 w-4" /> Stop
                    </Button>
                    <Button variant="outline" onClick={abort} className="gap-2">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={start} className="gap-2">
                    <Mic className="h-4 w-4" /> Record
                  </Button>
                )
              ) : (
                <span className="text-sm text-muted-foreground">Voice input not supported in this browser</span>
              )}
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{String(error)}</div>}

          <div className="space-y-2">
            <Label htmlFor="q">Your question</Label>
            <Textarea
              id="q"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={transcript ? transcript : "Speak or type your question..."}
              className="min-h-[96px]"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={ask} disabled={loading || !effectiveQuestion} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask
            </Button>
          </div>

          {!!answer && (
            <div className="space-y-2">
              <Label>Answer</Label>
              <div className="prose dark:prose-invert max-h-72 overflow-auto whitespace-pre-wrap rounded-md border p-3 text-sm">
                {answer}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
