import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { tasks as tasksTable } from "@/db/schema";

const geminiKey = process.env.GEMINI_API_KEY;
const ai = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// Store session states with conversation history and step index
const sessions: Record<string, { step: number; history: string[] }> = {};

type ExtractedTask = { title: string; estimatedMinutes: number };

function tryExtractTasks(text: string): ExtractedTask[] | null {
  try {
    // Look for a JSON array in the text
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed: unknown = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;
    const arr = parsed as Array<Record<string, unknown>>;
    const mapped = arr
      .map((t) => {
        const title = typeof t.title === "string" ? t.title : typeof t.name === "string" ? t.name : "Untitled";
        const raw =
          typeof t.estimatedMinutes === "number"
            ? t.estimatedMinutes
            : typeof t.minutes === "number"
            ? t.minutes
            : typeof t.duration === "number"
            ? t.duration
            : 25;
        const estimatedMinutes = Math.max(5, Math.min(120, Number(raw)));
        return { title, estimatedMinutes } as ExtractedTask;
      })
      .filter((t) => t.title && Number.isFinite(t.estimatedMinutes));
    return mapped.length ? mapped : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, message, clientId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { reply: "Oops, missing session ID! Please try again.", isFinal: true },
        { status: 400 }
      );
    }

    if (!ai) {
      return NextResponse.json(
        { reply: "AI is not configured. Please set GEMINI_API_KEY.", isFinal: true },
        { status: 500 }
      );
    }

    // Initialize session if not present
    if (!sessions[sessionId]) {
      sessions[sessionId] = { step: 0, history: [] };
    }

    const session = sessions[sessionId];

    if (message) {
      session.history.push(`User: ${String(message).trim()}`);
    }

    const systemPrompt = (
      "You are Chatty, an assistant that converts user inputs into a structured plan.\n" +
      "When appropriate, output ONLY a JSON array of tasks (no extra text).\n" +
      "Each task object should be {\"title\":string,\"estimatedMinutes\":number}."
    );

    const userPrompt = (
      "Conversation history (most recent last):\n" +
      session.history.join("\n") +
      "\nGenerate the next helpful reply. If you are ready to propose tasks, include only the JSON array."
    );

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const botReply = result.response?.text()?.trim() || "Sorry, I couldn't generate a response now.";

    // Add bot reply to session history
    session.history.push(`Bot: ${botReply}`);
    session.step++;

    // Try to extract tasks JSON and insert
    const extracted = tryExtractTasks(botReply);
    if (extracted && clientId) {
      for (const t of extracted) {
        await db.insert(tasksTable).values({ clientId, title: t.title, estimatedMinutes: t.estimatedMinutes, status: "pending", sessionId });
      }
    }

    const isFinal = false;

    return NextResponse.json({ reply: botReply, isFinal });
  } catch (error) {
    console.error("Error in /api/next:", error);
    return NextResponse.json(
      { reply: "Sorry, something went wrong. Please try again later.", isFinal: true },
      { status: 500 }
    );
  }
}
