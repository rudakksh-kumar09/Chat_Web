"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTimestamp } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Trash2, Smile } from "lucide-react";
import { useState, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageListProps {
  conversationId: Id<"conversations">;
}

/**
 * Message List Component
 * 
 * Features:
 * - Display all messages in conversation
 * - Real-time updates via Convex subscription
 * - Different styling for sent vs received messages
 * - Show sender avatar and name
 * - Timestamp on each message
 * - Handle deleted messages
 */
export function MessageList({ conversationId }: MessageListProps) {
  const { convexUser } = useCurrentUser();
  const [hoveredMessageId, setHoveredMessageId] = useState<Id<"messages"> | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<Id<"messages"> | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messages = useQuery(
    api.messages.listMessages,
    convexUser && conversationId
      ? { conversationId, currentUserId: convexUser._id }
      : "skip"
  );

  const deleteMessage = useMutation(api.messages.deleteMessage);
  const addReaction = useMutation(api.messages.addReaction);
  const removeReaction = useMutation(api.messages.removeReaction);

  const handleDelete = async (messageId: Id<"messages">) => {
    if (!convexUser) return;
    try {
      await deleteMessage({ messageId, userId: convexUser._id });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleReaction = async (messageId: Id<"messages">, emoji: string, userReacted: boolean) => {
    if (!convexUser) return;
    try {
      if (userReacted) {
        await removeReaction({ messageId, userId: convexUser._id });
      } else {
        await addReaction({ messageId, userId: convexUser._id, emoji });
      }
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!messages) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm text-muted-foreground">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === convexUser?._id;
        const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
        const sender = message.sender;
        const isHovered = hoveredMessageId === message._id;

        if (!sender) return null;

        return (
          <div
            key={message._id}
            className={cn(
              "flex gap-2 items-end group",
              isOwnMessage && "flex-row-reverse"
            )}
            onMouseEnter={() => {
              if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
              setHoveredMessageId(message._id);
            }}
            onMouseLeave={() => {
              hoverTimeout.current = setTimeout(() => {
                setHoveredMessageId(null);
                setShowEmojiPicker(null);
              }, 200);
            }}
          >
            {/* Avatar */}
            <div className={cn("flex-shrink-0", !showAvatar && "invisible")}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={sender.imageUrl} alt={sender.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(sender.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Message Content */}
            <div
              className={cn(
                "flex max-w-[65%] flex-col gap-1",
                isOwnMessage && "items-end"
              )}
            >
              {showAvatar && !isOwnMessage && (
                <span className="px-1 text-xs font-medium text-muted-foreground">
                  {sender.name}
                </span>
              )}

              <div
                className={cn(
                  "rounded-lg px-4 py-2",
                  isOwnMessage
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                  message.deleted && "italic opacity-60"
                )}
              >
                <p className="break-words text-sm">
                  {message.deleted ? "This message was deleted" : message.body}
                </p>
              </div>

              {/* Message reactions */}
              <MessageReactions
                messageId={message._id}
                currentUserId={convexUser?._id}
                onToggleReaction={(emoji, userReacted) =>
                  handleReaction(message._id, emoji, userReacted)
                }
              />

              <span className="px-1 text-xs text-muted-foreground">
                {formatMessageTimestamp(message.createdAt)}
              </span>
            </div>

            {/* Action buttons — rendered beside the bubble, never overlapping it */}
            {!message.deleted && (
              <div
                className={cn(
                  "relative flex flex-col items-center justify-end gap-1 pb-5 transition-opacity duration-100",
                  isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                {/* Emoji picker — floats above the action bar */}
                {showEmojiPicker === message._id && (
                  <div
                    className={cn(
                      "absolute bottom-full z-10 mb-1 flex gap-1 rounded-md border bg-background p-2 shadow-lg",
                      isOwnMessage ? "right-0" : "left-0"
                    )}
                  >
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          handleReaction(message._id, emoji, false);
                          setShowEmojiPicker(null);
                        }}
                        className="rounded p-1 text-xl hover:bg-accent"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-sm">
                  {/* Reaction button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() =>
                            setShowEmojiPicker(
                              showEmojiPicker === message._id ? null : message._id
                            )
                          }
                          className="rounded p-1 hover:bg-accent"
                        >
                          <Smile className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>React</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Delete button (only for own messages) */}
                  {isOwnMessage && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDelete(message._id)}
                            className="rounded p-1 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Message Reactions Component
 * Shows reaction counts and allows toggling reactions
 */
function MessageReactions({
  messageId,
  currentUserId,
  onToggleReaction,
}: {
  messageId: Id<"messages">;
  currentUserId?: Id<"users">;
  onToggleReaction: (emoji: string, userReacted: boolean) => void;
}) {
  const reactions = useQuery(api.messages.getMessageReactions, { messageId });

  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {reactions.map((reaction) => {
        const userReacted = currentUserId
          ? reaction.userIds.includes(currentUserId)
          : false;

        return (
          <TooltipProvider key={reaction.emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToggleReaction(reaction.emoji, userReacted)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                    userReacted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-medium">{reaction.count}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {userReacted ? "Remove reaction" : "Add reaction"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
