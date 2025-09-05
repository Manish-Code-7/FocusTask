import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { chatSessions, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

// --- 1) Groq client ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// --- 2) Create or get anonymous session (chat_sessions) ---
async function getOrCreateAnonSession(clientId: string, sessionId?: string) {
  if (sessionId) {
    const existing = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);
    if (existing.length > 0) return sessionId;
  }

  const newSessionId = crypto.randomUUID();
  await db.insert(chatSessions).values({
    id: newSessionId,
    clientId,
    title: "New Chat",
    isActive: true,
  });
  return newSessionId;
}

// --- 3) Parse "time" like "90", "1h", "1h 30m", "45m", "2 hours" -> minutes ---
function parseDurationToMinutes(input: string | number | null | undefined): number {
  if (input == null) return 30;
  if (typeof input === "number") return Math.max(1, Math.round(input));

  const s = String(input).toLowerCase().trim();
  // pure number
  if (/^\d+$/.test(s)) return Math.max(1, parseInt(s, 10));

  let minutes = 0;
  const hMatch = s.match(/(\d+(?:\.\d+)?)\s*h(ours?)?/);
  const mMatch = s.match(/(\d+(?:\.\d+)?)\s*m(in(ute)?s?)?/);
  if (hMatch) minutes += Math.round(parseFloat(hMatch[1]) * 60);
  if (mMatch) minutes += Math.round(parseFloat(mMatch[1]));
  return minutes > 0 ? minutes : 30;
}

// --- 4) Safe JSON extractor from LLM output ---
function extractTasksFromResponse(aiResponse: string) {
  try {
    // Prefer fenced code block ```json ... ```
    const fence = aiResponse.match(/```json\s*([\s\S]*?)```/i);
    const raw = fence ? fence[1] : (aiResponse.match(/\[[\s\S]*\]/)?.[0] ?? "");
    if (!raw) return [];

    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];

    return arr
      .map((t: { task?: string; estimatedTime?: string }) => ({
        name: String(t.task ?? "").trim(),
        time: String(t.estimatedTime ?? "").trim(),
        status: "pending" as const,
      }))
      .filter((t) => t.name.length > 0);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return [];
  }
}

// --- 5) Save tasks linked to chat_sessions.id ---
async function saveTasksToDatabase(
  tasksList: Array<{ name: string; time: string; status: string }>,
  clientId: string,
  sessionId: string
) {
  const rows = tasksList.map((t) => ({
    id: crypto.randomUUID(),
    clientId,
    sessionId,
    title: t.name,
    estimatedMinutes: parseDurationToMinutes(t.time),
    status: t.status,
  }));
  if (rows.length) {
    await db.insert(tasks).values(rows);
  }
}

// --- 6) POST handler ---
export async function POST(request: Request) {
  try {
    // Check if GROQ_API_KEY is available
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const { message, clientId, sessionId } = await request.json();

    // Basic validation (prevents the 400s you saw)
    if (!message || !clientId) {
      return NextResponse.json(
        { error: "Message and clientId are required." },
        { status: 400 }
      );
    }

    // Create/reuse anonymous session in chat_sessions
    const activeSessionId = await getOrCreateAnonSession(clientId, sessionId);

    // System prompt for Groq
    const systemPrompt = `
You are a motivating, empathetic task assistant.
Extract each goal or task user mentions, with estimated time for completion.
Only output the JSON list first, then a short, encouraging note.
Format extraction strictly as a JSON list:
[{"task":"<task>","estimatedTime":"<time>"}]
`;

    // Call Groq
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const aiResponse =
      chatCompletion.choices?.[0]?.message?.content || "No response from AI.";

    // Extract tasks and save
    const tasksList = extractTasksFromResponse(aiResponse);
    if (tasksList.length > 0) {
      await saveTasksToDatabase(tasksList, clientId, activeSessionId);
    }

    return NextResponse.json({
      response: aiResponse,
      tasks: tasksList,
      sessionId: activeSessionId,
    });
  } catch (error: unknown) {
    console.error("Server Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
