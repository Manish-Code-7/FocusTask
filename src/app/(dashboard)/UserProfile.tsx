"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UserProfile() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  const user = data?.user || null;

  if (isPending || !user) {
    return <div className="text-center text-gray-500 text-sm py-2">Loading...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/50 px-3 py-2 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:border-orange-200/50 transition-all duration-300 group">
          <Avatar className="h-8 w-8 ring-2 ring-orange-200/50 group-hover:ring-orange-300/50 transition-all">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-400 text-white font-semibold">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
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
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name || "User"} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-400 text-white text-2xl font-bold">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
