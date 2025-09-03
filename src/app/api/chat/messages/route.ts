import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, role, content } = body || {};
    
    if (!sessionId || !role || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [message] = await db
      .insert(chatMessages)
      .values({ sessionId, role, content })
      .returning();
    
    return NextResponse.json({ message });
  } catch (e) {
    console.error("POST /api/chat/messages error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
