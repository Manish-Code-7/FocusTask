import type { Metadata } from "next";
import Link from "next/link";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarRail, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Home, ListChecks, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfile from "./UserProfile"; // 👈 Client Component

export const metadata: Metadata = {
  title: "FocusTask",
  description: "Plan focused goals with AI assistance.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center justify-between px-2 py-3">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-lg font-bold">FocusTask</span>
                  <Badge variant="outline" className="text-[10px]">beta</Badge>
                </Link>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
              <SidebarGroup>
                <SidebarGroupLabel>Overview</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Link href="/" className="contents">
                        <SidebarMenuButton>
                          <Home className="w-4 h-4" />
                          <span>Dashboard</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/?filter=pending" className="contents">
                        <SidebarMenuButton>
                          <ListChecks className="w-4 h-4" />
                          <span>Pending</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/?filter=completed" className="contents">
                        <SidebarMenuButton>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>Assistant</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Link href="/chatbot" className="contents">
                        <SidebarMenuButton>
                          <MessageSquare className="w-4 h-4" />
                          <span>AI Assistant</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <div className="px-2 py-3">
                <UserProfile /> {/* ✅ Client Component handles hooks */}
              </div>
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          <SidebarInset>
            <div className={cn("border-b sticky top-0 z-20 bg-white/80")}>
              <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
                <SidebarTrigger />
                <div className="text-sm text-gray-600 font-medium">
                  Your focused day starts here ✨
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-6xl px-6 py-8">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
