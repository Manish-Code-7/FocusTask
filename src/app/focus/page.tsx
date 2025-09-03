"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { Pause, Play, RotateCcw } from "lucide-react";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function FocusPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const minsParam = searchParams.get("mins");

  const defaultSeconds = minsParam ? Math.max(5, Math.min(120, Number(minsParam))) * 60 : 45 * 60;

  const [duration, setDuration] = useState<number>(defaultSeconds);
  const [remaining, setRemaining] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  const progress = useMemo(() => (1 - remaining / duration) * 100, [remaining, duration]);

  function toggle() {
    setIsRunning((v) => !v);
    if (audioRef.current) {
      if (!isRunning) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }

  function reset() {
    setIsRunning(false);
    setRemaining(duration);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Deep Focus</h1>
        <Link href="/">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>

      {/* Visual container with soft gradient background */}
      <Card className="overflow-hidden border-0 shadow-none">
        <CardContent className="p-0">
          <div
            className="relative rounded-xl border"
            style={{
              background:
                "radial-gradient(1200px 600px at 60% 40%, rgba(255,176,25,0.35) 0%, rgba(255,142,142,0.25) 35%, rgba(255,255,255,0.9) 70%)",
            }}
          >
            {/* progress bar */}
            <div className="px-6 pt-6">
              <div className="h-3 w-full rounded-full border bg-white/60 backdrop-blur-sm" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                <div
                  className="h-full rounded-full bg-neutral-900"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-neutral-700">{Math.round(progress)}%</div>
            </div>

            {/* timer display with aura */}
            <div className="relative flex items-center justify-center py-16 sm:py-24">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 sm:h-96 sm:w-96 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255,176,25,0.65) 0%, rgba(255,142,142,0.35) 35%, rgba(255,142,142,0.15) 60%, rgba(255,255,255,0) 70%)",
                    filter: "blur(10px)",
                  }}
                />
              </div>
              <div className="relative select-none text-[120px] sm:text-[180px] leading-none font-serif tracking-tight text-neutral-900">
                {formatTime(remaining)}
              </div>
            </div>

            {/* controls + audio */}
            <div className="px-6 pb-6">
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button onClick={toggle} className="gap-2">
                      {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isRunning ? "Pause" : "Start"}
                    </Button>
                    <Button variant="outline" onClick={reset} className="gap-2">
                      <RotateCcw className="h-4 w-4" /> Reset
                    </Button>
                  </div>
                  <div className="w-full">
                    <div className="mb-2 text-sm text-muted-foreground">Duration (minutes)</div>
                    <Slider
                      defaultValue={[Math.round(duration / 60)]}
                      max={120}
                      min={5}
                      step={5}
                      onValueChange={(v) => setDuration(v[0] * 60)}
                    />
                  </div>
                </div>
                <div className="rounded-lg border bg-white/70 p-4 backdrop-blur">
                  <div className="text-sm text-muted-foreground mb-3">Ambient focus audio</div>
                  <audio ref={audioRef} loop controls className="w-full">
                    <source src="/focus.mp3" type="audio/mpeg" />
                  </audio>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Tip: keep volume low. Replace <code>/public/focus.mp3</code> with your favorite binaural beats.
                  </p>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="text-sm text-muted-foreground">
                {taskId ? (
                  <>Focusing on task #{taskId}. Stay in flow.</>
                ) : (
                  <>Enter a deep work session. Pause for short breaks; reset if distracted.</>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
