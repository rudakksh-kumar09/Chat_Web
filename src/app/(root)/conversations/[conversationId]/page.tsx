"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { ConversationList } from "@/components/conversations/conversation-list";
import { UserList } from "@/components/users/user-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, ArrowLeft, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatLastSeen } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

/**
 * Conversation Page
 * 
 * Desktop: Three-column (conversations | chat | user discovery)
 * Mobile: Full-width chat with back button
 * 
 * Features:
 * - Real-time messages, typing indicators
 * - Smart auto-scroll
 * - Mark as read
 * - Online presence
 */
export default function ConversationPage({ params }: ConversationPageProps) {
  const conversationId = params.conversationId as Id<"conversations">;
  const { convexUser } = useCurrentUser();
  const router = useRouter();

  const conversation = useQuery(
    api.conversations.getConversation,
    convexUser && conversationId
      ? { conversationId, currentUserId: convexUser._id }
      : "skip"
  );

  const messages = useQuery(
    api.messages.listMessages,
    convexUser && conversationId
      ? { conversationId, currentUserId: convexUser._id }
      : "skip"
  );

  const otherUserPresence = useQuery(
    api.presence.getUserPresence,
    conversation?.otherUser?._id
      ? { userId: conversation.otherUser._id }
      : "skip"
  );

  const markAsRead = useMutation(api.conversations.markAsRead);

  // Auto-scroll logic
  const { scrollRef, scrollToBottom, showScrollButton } = useAutoScroll(
    messages || []
  );

  // Mark as read when messages change
  const lastMessageId = messages?.[messages.length - 1]?._id;
  useEffect(() => {
    if (conversationId && convexUser?._id && lastMessageId) {
      markAsRead({
        conversationId,
        userId: convexUser._id,
        messageId: lastMessageId,
      });
    }
  }, [conversationId, convexUser?._id, lastMessageId, markAsRead]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!conversation || !convexUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = conversation.isGroup
    ? conversation.name || "Group Chat"
    : conversation.otherUser?.name || "Unknown User";

  const displayImage = conversation.isGroup
    ? undefined
    : conversation.otherUser?.imageUrl;

  const isOnline = otherUserPresence?.isOnline ?? false;
  const lastSeen = otherUserPresence?.lastSeen;

  return (
    <div className="flex h-full">
      {/* Left Sidebar: Conversation List (desktop only) */}
      <div className="hidden w-80 shrink-0 border-r md:block">
        <ConversationList />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex shrink-0 items-center gap-3 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur">
          {/* Back button (mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => router.push("/chats")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayImage} alt={displayName} />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {/* Online dot for DMs */}
            {!conversation.isGroup && isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>

          {/* Name + status */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-semibold leading-tight">{displayName}</h2>
              {conversation.isGroup && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {conversation.members?.length || 0}
                </span>
              )}
            </div>
            {!conversation.isGroup && (
              <p className={cn(
                "text-xs font-medium",
                isOnline ? "text-green-500" : "text-muted-foreground"
              )}>
                {isOnline ? "Active now" : lastSeen ? formatLastSeen(lastSeen) : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Messages Area with Auto-Scroll */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollRef}>
            <MessageList conversationId={conversationId} />
            <TypingIndicator conversationId={conversationId} />
          </ScrollArea>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-4 right-4 rounded-full shadow-lg"
              onClick={() => scrollToBottom(true)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Message Input */}
        <MessageInput
          conversationId={conversationId}
          currentUserId={convexUser._id}
        />
      </div>

      {/* Right Sidebar: User Discovery (desktop only) */}
      <div className="hidden w-72 shrink-0 border-l lg:block">
        <UserList />
      </div>
    </div>
  );
}
