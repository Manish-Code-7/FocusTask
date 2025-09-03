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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      const data = await res.json().catch(() => ({ reply: "No response body." }));
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? (res.ok ? "No reply from server." : "Server error.") },
      ]);
      if (data.isFinal) setFinished(true);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Network error." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-bold gradient-text mb-2">AI Assistant</h1>
          <p className="text-gray-600 font-medium">Plan your day with intelligent task management</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 animate-pulse-slow">
          ✨ Live
        </Badge>
      </div>
      
      <Card className="max-w-4xl mx-auto flex flex-col h-[700px] shadow-2xl rounded-2xl border-0 overflow-hidden animate-scale-in"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,240,0.8) 100%)" }}
      >
        <CardHeader className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                AI Chat Assistant
              </CardTitle>
              <p className="text-sm text-gray-600">Ready to help you plan your tasks</p>
            </div>
          </div>
        </CardHeader>

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
    </div>
  );
}
