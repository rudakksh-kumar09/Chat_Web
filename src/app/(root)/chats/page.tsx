"use client";

import { UserList } from "@/components/users/user-list";
import { ConversationList } from "@/components/conversations/conversation-list";
import { MessageCircle, Zap } from "lucide-react";

export default function ChatsPage() {
  return (
    <div className="flex h-full">
      {/* Left Sidebar: Conversation List */}
      <div className="w-full md:w-80 shrink-0">
        <ConversationList />
      </div>

      {/* Center: Welcome / empty state (desktop only) */}
      <div className="hidden flex-1 flex-col items-center justify-center gap-6 border-x bg-muted/20 md:flex">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
          <MessageCircle className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Your messages</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send private messages or start a group chat
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["Real-time messaging", "Group chats", "Reactions", "Online status"].map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
            >
              <Zap className="h-3 w-3 text-primary" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Right Sidebar: User Discovery (desktop only) */}
      <div className="hidden w-72 shrink-0 lg:block">
        <UserList />
      </div>
    </div>
  );
}
