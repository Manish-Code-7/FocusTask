import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

    const rows = await db.select().from(tasks).where(eq(tasks.clientId, clientId));
    return NextResponse.json({ tasks: rows });
  } catch (e) {
    console.error("GET /api/tasks error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, title, estimatedMinutes, status = "pending", sessionId } = body || {};
    if (!clientId || !title || !estimatedMinutes) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [row] = await db.insert(tasks).values({ clientId, title, estimatedMinutes, status, sessionId }).returning();
    return NextResponse.json({ task: row });
  } catch (e) {
    console.error("POST /api/tasks error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
