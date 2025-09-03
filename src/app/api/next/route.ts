import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Store session states with conversation history and step index
const sessions: Record<string, { step: number; history: string[] }> = {};

export async function POST(req: Request) {
  try {
    const { sessionId, message } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { reply: "Oops, missing session ID! Please try again.", isFinal: true },
        { status: 400 }
      );
    }

    // Initialize session if not present
    if (!sessions[sessionId]) {
      sessions[sessionId] = { step: 0, history: [] };
    }

    const session = sessions[sessionId];

    // Add user's latest message to history if not the first message
    if (message && session.step > 0) {
      session.history.push(`User: ${message.trim()}`);
    }

    // Compose prompt for Gemini generative model
    // Instructions request generating next question or concluding if done
    const systemPrompt = `
You are Chatty, an intelligent assistant designed to help users organize their tasks efficiently by breaking them down into focused work sessions with appropriate breaks.

Begin by asking the user what tasks they want to work on today.

Carefully collect and store all tasks the user mentions.

Analyze the user’s mood and tone from their input text.

If the user seems stressed, tired, or overwhelmed, plan for more frequent and longer breaks.

If the user seems energetic and motivated, plan for normal or fewer breaks.

Use a proven time management technique such as the Pomodoro technique or a similar method:

Divide each task into focused work sessions (e.g., 25 minutes) followed by short breaks (e.g., 5 minutes), with longer breaks after several sessions.

Insert breaks within each task session, not just between different tasks.

If the user omitted any key details like how long they want to spend on a task or session length, ask clear, specific questions to get those.

Create a detailed, timestamped schedule listing all tasks, showing:

Start and end times for each focused work session within tasks.

Break periods interspersed appropriately based on mood and technique.

Present the schedule clearly so the user can follow an efficient and balanced workflow.

    `.trim();

    const userPrompt = `
Conversation history:
${session.history.join("\n")}

If this is the start, ask a simple opening question about user mood.
Please generate ONLY the next question or final plan. Do NOT include explanations.
    `.trim();

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([systemPrompt, userPrompt]);

    const botReply = result.response?.text()?.trim() || "Sorry, I couldn't generate a question now.";

    // Add bot reply to session history
    session.history.push(`Bot: ${botReply}`);

    session.step++;

    // Decide if conversation is final (simple heuristic: if bot reply contains "plan" bullet points)
    const isFinal = botReply.toLowerCase().includes("•") || botReply.toLowerCase().includes("- ");

    // If conversation is final, clear session
    if (isFinal) {
      delete sessions[sessionId];
    }

    return NextResponse.json({ reply: botReply, isFinal });

  } catch (error) {
    console.error("Error in /api/next:", error);
    return NextResponse.json(
      { reply: "Sorry, something went wrong. Please try again later. 🙏", isFinal: true },
      { status: 500 }
    );
  }
}
