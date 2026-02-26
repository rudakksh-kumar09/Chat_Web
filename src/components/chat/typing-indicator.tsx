"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/use-current-user";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
}

/**
 * Typing Indicator Component
 * 
 * Shows "User is typing..." when someone is typing
 * Real-time updates from Convex
 */
export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const { convexUser } = useCurrentUser();

  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    convexUser && conversationId
      ? { conversationId, currentUserId: convexUser._id }
      : "skip"
  );

  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const names = typingUsers.map((u) => u.name).join(", ");
  const text =
    typingUsers.length === 1
      ? `${names} is typing...`
      : `${names} are typing...`;

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        {text}
        <span className="flex gap-0.5">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
        </span>
      </span>
    </div>
  );
}
