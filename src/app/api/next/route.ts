// app/api/next/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client (v4 SDK)
const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY!,
});

// Fixed flow of questions
const FLOW = [
  { key: "userMood", question: "How are you feeling today?" },
  { key: "focusScore", question: "On a scale of 1 to 10, how focused do you feel?" },
  { key: "tasksList", question: "What are the main tasks you want to work on today?" },
  { key: "deadlines", question: "Do you have any deadlines today?" },
  { key: "importantTask", question: "What is your most important task?" },
  { key: "workSession", question: "How long do you want each work session to be?" },
  { key: "syncCalendar", question: "Would you like to sync with your calendar?" },
  { key: "focusMode", question: "Should I enable focus mode for you?" },
];

// In-memory session store (not persistent – consider DB in production)
const sessions: Record<string, { step: number; answers: Record<string, string> }> = {};

export async function POST(req: Request) {
  try {
    const { sessionId, message } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ reply: "Missing session ID", isFinal: true }, { status: 400 });
    }

    if (!sessions[sessionId]) {
      sessions[sessionId] = { step: 0, answers: {} };
    }

    const session = sessions[sessionId];
    const step = session.step;

    // Save previous answer
    if (step > 0 && step <= FLOW.length) {
      const prevKey = FLOW[step - 1].key;
      session.answers[prevKey] = message?.trim?.() || "";
    }

    // If all questions answered → create final plan
    if (step >= FLOW.length) {
      const systemPrompt = `You are a friendly productivity coach.`;
      const userPrompt = `
Create a clear and concise daily productivity plan based on these inputs:

Mood: ${session.answers.userMood || "N/A"}
Focus score: ${session.answers.focusScore || "N/A"}
Tasks: ${session.answers.tasksList || "N/A"}
Deadlines: ${session.answers.deadlines || "N/A"}
Most important task: ${session.answers.importantTask || "N/A"}
Work session length: ${session.answers.workSession || "N/A"}
Calendar sync: ${session.answers.syncCalendar || "N/A"}
Focus mode: ${session.answers.focusMode || "N/A"}

Format the output as 5 to 8 bullet points, clear and actionable.
      `.trim();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // lighter/faster, or use "gpt-4o"
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
      });

      const plan = completion.choices[0].message?.content ?? "";

      // Clear session
      delete sessions[sessionId];

      return NextResponse.json({ reply: plan, isFinal: true });
    }

    // Ask next question
    const nextQuestion = FLOW[step].question;

    const systemPrompt = `You are a friendly productivity coach guiding a user through a daily productivity check-in.`;
    const userPrompt = `
Previous answers: ${JSON.stringify(session.answers, null, 2)}

Your task:
1. Polite acknowledgment of the user's previous answer (if exists).
2. Then ask the next question: "${nextQuestion}"
3. Keep it short, natural, friendly, and encouraging.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 150,
    });

    const botReply = completion.choices[0].message?.content ?? "";

    // Advance step AFTER generating response
    session.step++;

    return NextResponse.json({ reply: botReply, isFinal: false });
  } catch (error) {
    console.error("Error in /api/next:", error);
    return NextResponse.json(
      { reply: "Sorry, something went wrong. Please try again later.", isFinal: true },
      { status: 500 }
    );
  }
}
