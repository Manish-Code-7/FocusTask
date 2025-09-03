import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Home, ListChecks, CheckCircle2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusTask",
  description: "Plan focused goals with AI assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <Sidebar className="bg-white">
            <SidebarHeader>
              <div className="flex items-center justify-between px-2 py-1.5">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-base font-semibold">FocusTask</span>
                  <Badge variant="outline" className="text-[10px]">beta</Badge>
                </Link>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Overview</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Link href="/" className="contents">
                        <SidebarMenuButton>
                          <Home />
                          <span>Dashboard</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/?filter=pending" className="contents">
                        <SidebarMenuButton>
                          <ListChecks />
                          <span>Pending</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/?filter=completed" className="contents">
                        <SidebarMenuButton>
                          <CheckCircle2 />
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
                          <MessageSquare />
                          <span>Open Chatbot</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="px-2 py-2">
                <div className="flex items-center gap-3 rounded-md border px-2 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-200 text-gray-700">MM</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">Manish Maddikeri</div>
                    <div className="text-xs text-muted-foreground truncate">manish@example.com</div>
                  </div>
                </div>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <div className={cn("border-b sticky top-0 z-20 bg-background")}> 
              <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4">
                <SidebarTrigger />
                <div className="text-sm text-muted-foreground">Your focused day starts here</div>
              </div>
            </div>
            <div
              className="mx-auto w-full max-w-6xl px-4 py-6"
              style={{
                background:
                  "radial-gradient(1000px 500px at 85% 0%, rgba(255,176,25,0.18) 0%, rgba(255,142,142,0.12) 30%, rgba(255,255,255,0) 60%)",
                borderRadius: "12px",
              }}
            >
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
