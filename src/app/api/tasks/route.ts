import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/tasks - Fetch tasks for a specific client
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const taskList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.clientId, clientId))
      .orderBy(tasks.createdAt);

    return NextResponse.json({ tasks: taskList });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const { clientId, title, estimatedMinutes, sessionId } = await request.json();

    if (!clientId || !title || !estimatedMinutes) {
      return NextResponse.json(
        { error: "Client ID, title, and estimated minutes are required" },
        { status: 400 }
      );
    }

    const newTask = await db.insert(tasks).values({
      id: crypto.randomUUID(),
      clientId,
      title: title.trim(),
      estimatedMinutes: Math.max(1, Math.round(Number(estimatedMinutes))),
      status: "pending",
      sessionId: sessionId || null,
    }).returning();

    return NextResponse.json({ task: newTask[0] });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
