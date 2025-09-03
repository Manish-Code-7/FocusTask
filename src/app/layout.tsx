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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
          <Sidebar className="bg-gradient-to-b from-white via-gray-50 to-white border-r border-gray-200/50 shadow-lg">
            <SidebarHeader className="border-b border-gray-200/50">
              <div className="flex items-center justify-between px-2 py-3">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="text-lg font-bold gradient-text">FocusTask</span>
                  <Badge variant="outline" className="text-[10px] bg-gradient-to-r from-orange-100 to-pink-100 border-orange-200 text-orange-700">beta</Badge>
                </Link>
              </div>
            </SidebarHeader>
            <SidebarContent className="px-2">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Overview</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                      <Link href="/" className="contents">
                        <SidebarMenuButton className="hover-lift rounded-lg group">
                          <Home className="w-4 h-4 group-hover:text-orange-500 transition-colors" />
                          <span className="font-medium">Dashboard</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/?filter=pending" className="contents">
                        <SidebarMenuButton className="hover-lift rounded-lg group">
                          <ListChecks className="w-4 h-4 group-hover:text-orange-500 transition-colors" />
                          <span className="font-medium">Pending</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/?filter=completed" className="contents">
                        <SidebarMenuButton className="hover-lift rounded-lg group">
                          <CheckCircle2 className="w-4 h-4 group-hover:text-green-500 transition-colors" />
                          <span className="font-medium">Completed</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator className="my-4" />
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Assistant</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Link href="/chatbot" className="contents">
                        <SidebarMenuButton className="hover-lift rounded-lg group bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200/50">
                          <MessageSquare className="w-4 h-4 group-hover:text-orange-500 transition-colors" />
                          <span className="font-medium">AI Assistant</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-gray-200/50">
              <div className="px-2 py-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200/50 px-3 py-2 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:border-orange-200/50 transition-all duration-300 group">
                      <Avatar className="h-8 w-8 ring-2 ring-orange-200/50 group-hover:ring-orange-300/50 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-400 text-white font-semibold">MM</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-gray-800">Manish Maddikeri</div>
                        <div className="text-xs text-gray-500 truncate">manish@example.com</div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md animate-scale-in">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold gradient-text">User Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 ring-4 ring-orange-200/50">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-400 text-white text-2xl font-bold">MM</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Manish Maddikeri</h3>
                          <p className="text-sm text-gray-500">manish@example.com</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50">
                          <span className="text-sm font-medium text-gray-700">Member since:</span>
                          <span className="text-sm font-semibold text-gray-800">January 2024</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                          <span className="text-sm font-medium text-gray-700">Total tasks:</span>
                          <span className="text-sm font-semibold text-blue-600">24</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                          <span className="text-sm font-medium text-gray-700">Completed:</span>
                          <span className="text-sm font-semibold text-green-600">18</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50">
                          <span className="text-sm font-medium text-gray-700">Focus sessions:</span>
                          <span className="text-sm font-semibold text-purple-600">156</span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className={cn("border-b sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm")}> 
              <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
                <SidebarTrigger className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-300" />
                <div className="text-sm text-gray-600 font-medium">Your focused day starts here ✨</div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-6xl px-6 py-8">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
