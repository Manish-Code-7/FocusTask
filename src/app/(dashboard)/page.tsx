"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, CheckCircle2, ListChecks, Timer } from "lucide-react";

type TaskStatus = "pending" | "completed";

type Task = {
  id: string;
  title: string;
  estimatedMinutes: number;
  status: TaskStatus;
};

function getClientId() {
  if (typeof window === "undefined") return "server";
  const key = "ft_client_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export default function Home() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("filter") as TaskStatus) ?? "pending";

  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const clientId = typeof window !== "undefined" ? getClientId() : "server";

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?clientId=${clientId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [clientId]);

  // Load tasks on mount & poll every 5 seconds
  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  // Memoize filtered tasks
  const pending = useMemo(() => tasks.filter((t) => t.status === "pending"), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.status === "completed"), [tasks]);

  // Add new task
  const addTask = useCallback(async () => {
    const trimmed = title.trim();
    const mins = Number(minutes);
    if (!trimmed || !Number.isFinite(mins) || mins <= 0) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, title: trimmed, estimatedMinutes: Math.round(mins) }),
    });
    setTitle("");
    setMinutes("");
    fetchTasks();
  }, [title, minutes, clientId, fetchTasks]);

  // Mark task as done
  const markDone = useCallback(
    async (id: string) => {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      fetchTasks();
    },
    [fetchTasks]
  );

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-gray-600 font-medium">Track your goals and stay focused ✨</p>
        </div>
        <Link href="/chatbot">
          <Button className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <MessageSquare className="h-4 w-4" /> AI Assistant
          </Button>
        </Link>
      </div>

      {/* Task Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Pending Tasks */}
        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <ListChecks className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">{pending.length}</div>
                <div className="text-sm text-gray-500">Awaiting completion</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">{completed.length}</div>
                <div className="text-sm text-gray-500">Successfully done</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus Time */}
        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Focus Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Timer className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {pending.reduce((sum, t) => sum + t.estimatedMinutes, 0)}
                </div>
                <div className="text-sm text-gray-500">Minutes estimated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Goal Form */}
      <Card style={{ background: "radial-gradient(800px 300px at 90% 0%, rgba(255,176,25,0.10), rgba(255,255,255,0))" }}>
        <CardHeader>
          <CardTitle className="text-base">Add a goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="e.g., Draft weekly update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                placeholder="Time (mins)"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-36"
              />
              <Button onClick={addTask} className="gap-2">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Pending & Completed */}
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <Card style={{ background: "linear-gradient(180deg, rgba(255,176,25,0.07), rgba(255,255,255,0))" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today’s pending goals</CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <div className="text-sm text-muted-foreground">No pending items.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Goal</TableHead>
                      <TableHead className="w-36">Time</TableHead>
                      <TableHead className="w-40"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell>{t.estimatedMinutes} mins</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/focus?taskId=${t.id}&mins=${t.estimatedMinutes}`}>
                              <Button size="sm" className="gap-1">
                                <Timer className="h-4 w-4" /> Start now
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => markDone(t.id)}>
                              Mark done
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Completed goals</CardTitle>
            </CardHeader>
            <CardContent>
              {completed.length === 0 ? (
                <div className="text-sm text-muted-foreground">No completed items yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Goal</TableHead>
                      <TableHead className="w-36">Time</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completed.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell>{t.estimatedMinutes} mins</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* AI Chatbot Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Let AI analyze your input and plan your day.</div>
        <Link href="/chatbot">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Open Chatbot
          </Button>
        </Link>
      </div>
    </div>
  );
}
