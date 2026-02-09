import { GoogleGenerativeAI } from "@google/generative-ai";

export type ReplyMode = "same" | "english";

export async function getGeminiAnswer(
  question: string,
  opts: { reply: ReplyMode; userLang?: string }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const envModel = (import.meta.env.VITE_GEMINI_MODEL as string | undefined)?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY. Add it to your .env (and deployment env) and restart the dev server."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Some environments return 404 for certain aliases under v1beta.
  // Try a list of compatible models in order until one succeeds.
  const candidates = [
    // If user provided a model in env, try it first
    ...(envModel ? [envModel] : []),
    // Common current models
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    // Aliases and earlier revs
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro-002",
    // Older stable
    "gemini-1.0-pro",
    // Legacy text model (SDK may still route)
    "gemini-pro",
  ];

  const languageDirective =
    opts.reply === "english"
      ? "Respond in English."
      : opts.userLang
      ? `Respond in the user's language: ${opts.userLang}.`
      : "Detect the input language and respond in that same language.";

  const prompt = `You are AgriMind's voice assistant for farmers.
- Provide clear, practical, and safe agriculture guidance.
- If giving recommendations (e.g., fertilizers, pesticides), include safety, dosage ranges, and advise consulting local experts when needed.
- Be concise: prefer short paragraphs and bullet points.
- If the question is unrelated to agriculture, politely redirect.
- ${languageDirective}

User question:
${question}`;

  let lastErr: any = null;
  for (const m of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });
      const text = result.response.text();
      return text?.trim() || "Sorry, I couldn't generate an answer right now.";
    } catch (e: any) {
      const msg = String(e?.message || e);
      // Try next model only for 404/not found/unsupported errors
      if (/404|not\s*found|unsupported/i.test(msg)) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  // If we reach here, try backend proxy as a fallback (keeps key server-side and bypasses client API limits)
  try {
    const resp = await fetch(`/api/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        reply: opts.reply,
        userLang: opts.userLang,
      }),
    });
    const data = await resp.json();
    if (resp.ok && typeof data?.text === 'string') {
      return data.text.trim() || "Sorry, I couldn't generate an answer right now.";
    }
    throw new Error(data?.error || `Backend proxy error (${resp.status})`);
  } catch (proxyErr: any) {
    const hint =
      `No compatible Gemini model found via client, and backend proxy failed. Ensure API access and set VITE_GEMINI_MODEL or server GEMINI_MODEL. Proxy error: ${String(proxyErr?.message || proxyErr)}`;
    if (lastErr) {
      const err = new Error(hint);
      // @ts-ignore
      err.cause = lastErr;
      throw err;
    }
    throw new Error(hint);
  }
}
