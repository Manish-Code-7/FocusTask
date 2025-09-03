import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const sessionId = searchParams.get("sessionId");
    
    if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

    if (sessionId) {
      // Get messages for specific session
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);
      
      return NextResponse.json({ messages });
    } else {
      // Get all sessions for client
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.clientId, clientId))
        .orderBy(desc(chatSessions.updatedAt));
      
      return NextResponse.json({ sessions });
    }
  } catch (e) {
    console.error("GET /api/chat error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, title = "New Chat" } = body || {};
    
    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }

    const [session] = await db
      .insert(chatSessions)
      .values({ clientId, title })
      .returning();
    
    return NextResponse.json({ session });
  } catch (e) {
    console.error("POST /api/chat error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
