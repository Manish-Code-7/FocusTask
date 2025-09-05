"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
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
import { v4 as uuidv4 } from "uuid";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

export default function ChatBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [clientId] = useState(() => uuidv4()); // Generate unique client ID

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { id: Date.now(), sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: trimmed,
          clientId: clientId // Include the required clientId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: data?.response || "No reply from server.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat API error:", err);
      setMessages((prev) => [...prev, { 
        id: Date.now() + 2, 
        sender: "bot", 
        text: "⚠️ Sorry, I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">AI Assistant</h1>
          <p className="text-gray-600 font-medium">Plan your day with intelligent task management</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 animate-pulse-slow">
          ✨ Live
        </Badge>
      </div>

      {/* Chat Card */}
      <Card className="max-w-4xl mx-auto flex flex-col h-[700px] shadow-2xl rounded-2xl border-0 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,248,240,0.8) 100%)" }}
      >
        <CardHeader className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">AI Chat Assistant</CardTitle>
              <p className="text-sm text-gray-600">Ready to help you plan your tasks</p>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-4 overflow-hidden rounded-b-xl"
          style={{ background: "linear-gradient(180deg, rgba(255,142,142,0.08), rgba(255,255,255,0))" }}
        >
          <ScrollArea className="h-full space-y-4 p-3">
            {messages.length === 0 && !loading && (
              <p className="text-center text-gray-400 mt-20 select-none">
                Start the conversation...
              </p>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`flex items-start gap-2 max-w-xs ${isUser ? "ml-auto justify-end" : "justify-start"}`}>
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
                      {msg.text}
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

            {loading && (
              <div className="flex justify-start items-center gap-2 ml-1 text-gray-500">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-200" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-400" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>

        <Separator className="border-gray-200" />

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 p-4 rounded-b-xl"
          style={{ background: "linear-gradient(0deg, rgba(255,176,25,0.06), rgba(255,255,255,0))" }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            autoFocus
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || loading} className="flex items-center gap-1">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
