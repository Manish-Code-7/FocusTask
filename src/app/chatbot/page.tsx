"use client";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatBot() {
  const [sessionId] = useState(() => uuidv4()); // Unique session ID on mount
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);

  // Ref to the messages container to scroll to bottom on new message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Append user message
    setMessages((prev) => [...prev, { role: "user", text: input.trim() }]);
    setInput("");

    try {
      const res = await fetch("/api/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: input.trim() }),
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);

      if (data.isFinal) {
        setFinished(true);
      }
    } catch (error) {
      // Optionally handle error state here (e.g. show error message)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, there was an error sending your message." },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !finished && input.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-4 shadow-lg rounded-2xl bg-white">
      <CardContent className="space-y-4 flex flex-col">
        <div
          className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50"
          style={{ scrollbarWidth: "thin" }}
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.length === 0 && (
            <p className="text-gray-400 text-center select-none mt-20">Start the conversation...</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-3 max-w-[80%] px-4 py-2 rounded-lg shadow-sm ${
                m.role === "user"
                  ? "ml-auto bg-blue-600 text-white text-right"
                  : "mr-auto bg-green-100 text-green-900 text-left"
              }`}
            >
              {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {!finished && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <Input
              aria-label="Type your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1"
              disabled={finished}
            />
            <Button type="submit" disabled={!input.trim()}>
              Send
            </Button>
          </form>
        )}

        {finished && (
          <p className="text-center text-gray-500 mt-2 select-none">Conversation has ended.</p>
        )}
      </CardContent>
    </Card>
  );
}
