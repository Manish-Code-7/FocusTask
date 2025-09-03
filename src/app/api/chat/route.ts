import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Example: Replace with actual DB logic, e.g., Prisma or Drizzle
async function saveTasksToDatabase(tasks: Array<{ name: string, time: string, status: string }>, userId: string) {
  // Implement DB insert here
  return true;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    // system prompt includes instructions and motivation
    const systemPrompt = `
You are a motivating, empathetic task assistant.
Extract each goal or task user mentions, with estimated time for completion.
If user appears sad, say something uplifting and suggest a walk or nap.
After extracting, display tasks in a table with breaks included.
Always end responses with encouragement. 
Output extraction first, then the table, then advice.
Format extraction as JSON list:
[{"task":"<task>","estimatedTime":"<time>"}]
`;

    // Send message to Groq for extraction and motivation
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "No response from Llama.";

    // Try to extract the JSON block from the Llama response
    let tasks: Array<{ task: string; estimatedTime: string }> = [];
    try {
      const jsonMatch = aiResponse.match(/\[([\s\S]*?)\]/gm);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      // Handle JSON parse errors gracefully
      tasks = [];
    }

    // Convert tasks to a table text
    let taskTableTxt = "Your tasks and times:\n";
    if (tasks.length) {
      taskTableTxt += "| Task | Time | Status |\n| --- | --- | --- |\n";
      for (const t of tasks) {
        taskTableTxt += `| ${t.task} | ${t.estimatedTime} | Pending |\n`;
      }
    }

    // Store tasks in DB (status: pending)
    if (tasks.length && userId) {
      await saveTasksToDatabase(
        tasks.map(t => ({ name: t.task, time: t.estimatedTime, status: "pending" })),
        userId
      );
    }

    // If user sounds sad, append suggestion for walk/nap (basic heuristic)
    const sad = /sad|depressed|not in a good mood|tired|down/i.test(message);
    const breakAdvice = sad
      ? "I noticed you might not be feeling great. How about taking a short walk or quick nap before starting your tasks? 🌞"
      : "Remember to take regular short breaks for better focus!";

    const motivational = "\nI'm cheering for you! Let's make today awesome together! 💪";

    // Final response assembly
    const responseMessage = `${aiResponse}\n\n${taskTableTxt}\n${breakAdvice}\n${motivational}`;

    return NextResponse.json({ response: responseMessage, tasks });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error?.message || "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}