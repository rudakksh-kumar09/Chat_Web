import { Doc, Id } from "../../convex/_generated/dataModel";

/**
 * Type-safe definitions for the application
 */

export type User = Doc<"users">;
export type Conversation = Doc<"conversations">;
export type ConversationMember = Doc<"conversationMembers">;
export type Message = Doc<"messages">;
export type TypingIndicator = Doc<"typingIndicators">;
export type Reaction = Doc<"reactions">;

export type UserId = Id<"users">;
export type ConversationId = Id<"conversations">;
export type MessageId = Id<"messages">;

/**
 * Extended types for UI components
 */

export interface ConversationWithDetails extends Conversation {
  otherUser?: User;              // For DMs
  members?: User[];              // For group chats
  lastMessage?: Message;
  unreadCount?: number;
}

export interface MessageWithSender extends Message {
  sender: User;
  reactions?: Array<{
    emoji: string;
    count: number;
    userIds: UserId[];
  }>;
}

export interface UserPresence {
  userId: UserId;
  isOnline: boolean;
  lastSeen: number;
}
