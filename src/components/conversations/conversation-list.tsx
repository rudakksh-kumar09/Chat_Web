"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter, useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Users } from "lucide-react";
import { formatMessageTimestamp } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { CreateGroupDialog } from "@/components/conversations/create-group-dialog";

/**
 * Conversation List Component (Sidebar)
 * 
 * Features:
 * - Shows all user's conversations
 * - Real-time updates
 * - Last message preview
 * - Unread count badge
 * - Sorted by most recent activity
 * - Highlight active conversation
 */
export function ConversationList() {
  const { convexUser } = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const activeConversationId = params.conversationId as string | undefined;

  const conversations = useQuery(
    api.conversations.listUserConversations,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getConversationName = (conversation: NonNullable<typeof conversations>[number]) => {
    if (conversation.isGroup) {
      return conversation.name || "Group Chat";
    }
    return conversation.otherUser?.name || "Unknown User";
  };

  const getConversationImage = (conversation: NonNullable<typeof conversations>[number]) => {
    if (conversation.isGroup) {
      return undefined;
    }
    return conversation.otherUser?.imageUrl;
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-base font-bold">Messages</h2>
          {convexUser && (
            <p className="text-xs text-muted-foreground">{convexUser.name}</p>
          )}
        </div>
        {convexUser && <CreateGroupDialog currentUserId={convexUser._id} />}
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {!convexUser && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="mb-3 h-10 w-10 animate-pulse text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          )}

          {convexUser && conversations?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">No messages yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Search for people to start a chat
              </p>
            </div>
          )}

          {conversations?.map((conversation) => {
            const isActive = activeConversationId === conversation._id;
            const displayName = getConversationName(conversation);
            const imageUrl = getConversationImage(conversation);
            const hasUnread = conversation.unreadCount > 0;

            return (
              <button
                key={conversation._id}
                onClick={() => router.push(`/conversations/${conversation._id}`)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                  isActive ? "bg-primary/10" : "hover:bg-muted/60"
                )}
              >
                {/* Avatar with online dot */}
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={imageUrl} alt={displayName} />
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Group icon badge */}
                  {conversation.isGroup && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
                      <Users className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "truncate text-sm",
                      hasUnread ? "font-bold text-foreground" : "font-medium"
                    )}>
                      {displayName}
                    </p>
                    {conversation.lastMessage && (
                      <span className={cn(
                        "shrink-0 text-xs",
                        hasUnread ? "font-semibold text-primary" : "text-muted-foreground"
                      )}>
                        {formatMessageTimestamp(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={cn(
                      "truncate text-xs",
                      hasUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}>
                      {conversation.isGroup && !conversation.lastMessage
                        ? `${conversation.members.length} members`
                        : conversation.lastMessage?.deleted
                          ? "Message deleted"
                          : conversation.lastMessage?.body || "No messages yet"}
                    </p>
                    {hasUnread && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
