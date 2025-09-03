import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();
    const { title, estimatedMinutes, status } = body || {};

    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (estimatedMinutes !== undefined) updates.estimatedMinutes = estimatedMinutes;
    if (status !== undefined) updates.status = status;

    const [row] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return NextResponse.json({ task: row });
  } catch (e) {
    console.error("PATCH /api/tasks/[id] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
