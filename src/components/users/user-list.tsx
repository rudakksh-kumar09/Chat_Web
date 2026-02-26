"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User as UserIcon } from "lucide-react";
import { formatLastSeen } from "@/lib/date-utils";

/**
 * User Discovery Component
 * 
 * Features:
 * - List all users except current user
 * - Real-time search by name/email
 * - Show online status with green dot
 * - Click to start/open DM conversation
 */
export function UserList() {
  const { convexUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const users = useQuery(
    api.users.listUsers,
    convexUser
      ? { currentUserId: convexUser._id, searchQuery }
      : "skip"
  );

  const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);

  const handleUserClick = async (otherUserId: Id<"users">) => {
    if (!convexUser) return;

    try {
      const conversationId = await getOrCreateDM({
        currentUserId: convexUser._id,
        otherUserId,
      });

      router.push(`/conversations/${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search Bar */}
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {!convexUser && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserIcon className="mb-2 h-12 w-12 animate-pulse text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading users...
              </p>
            </div>
          )}

          {convexUser && users?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserIcon className="mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No users found" : "No users available"}
              </p>
            </div>
          )}

          {users?.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserClick(user._id)}
              className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={user.imageUrl} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>

              <div className="flex-1 text-left">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
