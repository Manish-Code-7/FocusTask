import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/tasks/[id] - Update task status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!status || !["pending", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status (pending or completed) is required" },
        { status: 400 }
      );
    }

    const updatedTask = await db
      .update(tasks)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task: updatedTask[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
