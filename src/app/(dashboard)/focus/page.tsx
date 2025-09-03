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

  const defaultMinutes = minsParam ? Math.max(5, Math.min(120, Number(minsParam))) : 45;
  const defaultSeconds = defaultMinutes * 60;

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
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-bold gradient-text mb-2">Deep Focus</h1>
          <p className="text-gray-600 font-medium">Enter your flow state with ambient focus</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all duration-300">
            ← Back to dashboard
          </Button>
        </Link>
      </div>

      {/* Visual container with enhanced gradient background */}
      <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl animate-scale-in">
        <CardContent className="p-0">
          <div
            className="relative rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,248,240,0.9) 25%, rgba(255,240,245,0.8) 50%, rgba(240,248,255,0.9) 75%, rgba(255,255,255,0.95) 100%)",
            }}
          >
            {/* Enhanced progress bar */}
            <div className="px-8 pt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-bold text-gray-800">{Math.round(progress)}%</span>
              </div>
              <div className="h-4 w-full rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-inner" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Enhanced timer display with aura */}
            <div className="relative flex items-center justify-center py-20 sm:py-28">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-float">
                <div className="h-80 w-80 sm:h-[400px] sm:w-[400px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255,176,25,0.4) 0%, rgba(255,142,142,0.3) 30%, rgba(255,142,142,0.1) 60%, rgba(255,255,255,0) 80%)",
                    filter: "blur(20px)",
                  }}
                />
              </div>
              <div className="relative select-none text-[140px] sm:text-[200px] leading-none font-bold tracking-tight gradient-text animate-pulse-slow">
                {formatTime(remaining)}
              </div>
            </div>

            {/* Enhanced controls + audio */}
            <div className="px-8 pb-8">
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={toggle} 
                      className="gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      {isRunning ? "Pause" : "Start Focus"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={reset} 
                      className="gap-2 px-6 py-4 border-2 hover:bg-gray-50 transition-all duration-300"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset
                    </Button>
                  </div>
                  <div className="w-full max-w-sm">
                    <div className="mb-3 text-sm font-semibold text-gray-700 text-center">Duration (minutes)</div>
                    <Slider
                      defaultValue={[defaultMinutes]}
                      max={120}
                      min={5}
                      step={5}
                      onValueChange={(v) => setDuration(v[0] * 60)}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center mt-2">5-120 minutes</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur shadow-lg">
                  <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Ambient Focus Audio
                  </div>
                  <audio ref={audioRef} loop controls className="w-full rounded-lg">
                    <source src="/focus.mp3" type="audio/mpeg" />
                  </audio>
                  <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    💡 <strong>Tip:</strong> Keep volume low for optimal focus. Replace <code>/public/focus.mp3</code> with your favorite binaural beats or nature sounds.
                  </p>
                </div>
              </div>
              <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">
                  {taskId ? (
                    <>🎯 Focusing on task #{taskId}. Stay in the flow state.</>
                  ) : (
                    <>✨ Enter a deep work session. Pause for short breaks; reset if distracted.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

