"use client";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User } from "lucide-react";

function getClientId() {
  const key = "ft_client_id";
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export default function ChatBotPage() {
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [finished, setFinished] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientId = typeof window !== "undefined" ? getClientId() : "server";

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isSending || finished) return;
    setMessages((m) => [...m, { role: "user", text: trimmedInput }]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: trimmedInput, clientId }),
      });

      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? "No reply from server." },
      ]);
      if (data.isFinal) setFinished(true);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Error sending message." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto flex flex-col h-[600px] shadow-md rounded-xl border mt-8"
      style={{ background: "radial-gradient(900px 400px at 90% -10%, rgba(255,176,25,0.10), rgba(255,255,255,0))" }}
    >
      {/* Header */}
      <CardHeader className="flex items-center justify-between p-4 rounded-t-xl"
        style={{ background: "linear-gradient(180deg, rgba(255,176,25,0.10), rgba(255,255,255,0))" }}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-gray-700" />
          <CardTitle className="text-lg font-semibold text-gray-900">
            AI Chat Assistant
          </CardTitle>
          <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
            Live
          </Badge>
        </div>
      </CardHeader>

      {/* Messages scroll area */}
      <CardContent className="flex-1 p-4 overflow-hidden rounded-b-xl"
        style={{ background: "linear-gradient(180deg, rgba(255,142,142,0.08), rgba(255,255,255,0))" }}
      >
        <ScrollArea className="h-full space-y-4 p-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 mt-20 select-none">
              Start the conversation...
            </p>
          )}

          {messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div
                key={i}
                className={`flex items-start gap-2 max-w-xs ${
                  isUser ? "justify-end ml-auto" : "justify-start"
                }`}
              >
                {!isUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl text-sm break-words prose prose-sm max-w-none ${
                    isUser
                      ? "bg-gray-800 text-white rounded-br-none"
                      : "bg-white/90 backdrop-blur text-gray-900 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                </div>

                {isUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-300 text-gray-600">
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <Separator className="border-gray-200" />

      {/* Input area */}
      {!finished ? (
        <form
          className="flex gap-2 p-4 rounded-b-xl"
          style={{ background: "linear-gradient(0deg, rgba(255,176,25,0.06), rgba(255,255,255,0))" }}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            autoFocus
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isSending}
            className="flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </form>
      ) : (
        <p className="text-center text-gray-500 py-4 select-none">
          Conversation has ended.
        </p>
      )}
    </Card>
  );
}
