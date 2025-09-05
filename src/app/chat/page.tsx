"use client";
import { useState } from "react";

export default function ChatTestPage() {
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function test() {
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "I need to do 1h workout, 30m reading, and 45m coding.",
        clientId: "guest-123",
      }),
    });
    const data = await res.json();
    setOut(data);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={test}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        {loading ? "Sending..." : "Send Test Message"}
      </button>

      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
        {out ? JSON.stringify(out, null, 2) : "No response yet"}
      </pre>
    </div>
  );
}
