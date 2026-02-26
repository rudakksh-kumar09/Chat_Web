import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Production-grade Convex schema for real-time chat application
 * 
 * Design Principles:
 * - Normalized data structure (no redundancy)
 * - Strategic indexing for performance
 * - Type-safe with full TypeScript support
 * - Optimized for real-time subscriptions
 */

export default defineSchema({
  /**
   * USERS TABLE
   * 
   * Stores user profiles synced from Clerk
   * 
   * Indexes:
   * - by_clerk_id: Fast lookup when syncing from Clerk webhook (unique user access)
   * - by_is_online: Efficiently query online users for presence features
   */
  users: defineTable({
    clerkId: v.string(),        // Clerk user ID (unique)
    name: v.string(),            // Full name or display name
    email: v.string(),           // Email address
    imageUrl: v.string(),        // Profile picture URL from Clerk
    isOnline: v.boolean(),       // Current online status
    lastSeen: v.number(),        // Timestamp of last activity
  })
    .index("by_clerk_id", ["clerkId"])      // For user lookup and sync
    .index("by_is_online", ["isOnline"]),   // For filtering online users

  /**
   * CONVERSATIONS TABLE
   * 
   * Represents chat conversations (DM or group)
   * 
   * Design: Keep minimal data here. Participant info is in conversationMembers.
   * This allows flexible membership changes without data duplication.
   * 
   * Indexes:
   * - by_is_group: Separate DMs from group chats for different UI flows
   */
  conversations: defineTable({
    isGroup: v.boolean(),                    // false = DM, true = group chat
    name: v.optional(v.string()),            // null for DMs, set for groups
    createdAt: v.number(),                   // Timestamp of creation
    lastMessageAt: v.optional(v.number()),   // Last activity for sorting
  })
    .index("by_is_group", ["isGroup"]),

  /**
   * CONVERSATION_MEMBERS TABLE
   * 
   * Junction table for conversation participants
   * 
   * Critical for:
   * - Finding all conversations for a user
   * - Finding all members of a conversation
   * - Tracking read status per user
   * 
   * Indexes:
   * - by_user_id: Get all conversations for a user (primary sidebar query)
   * - by_conversation_id: Get all members of a conversation
   * - by_conversation_and_user: Check membership, update read status
   */
  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),  // For unread count
    joinedAt: v.number(),                              // When user joined
  })
    .index("by_user_id", ["userId"])
    .index("by_conversation_id", ["conversationId"])
    .index("by_conversation_and_user", ["conversationId", "userId"]),

  /**
   * MESSAGES TABLE
   * 
   * Core message data
   * 
   * Design: Soft delete (deleted flag) preserves conversation continuity
   * 
   * Indexes:
   * - by_conversation_id: Fetch messages for a conversation (most common query)
   * - by_conversation_created: Fetch messages ordered by time
   */
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),                    // Message text
    createdAt: v.number(),               // Timestamp
    deleted: v.boolean(),                // Soft delete flag
  })
    .index("by_conversation_id", ["conversationId"])
    .index("by_conversation_created", ["conversationId", "createdAt"]),

  /**
   * TYPING_INDICATORS TABLE
   * 
   * Ephemeral typing status
   * 
   * Design: Auto-expire after 2 seconds using expiresAt
   * Mutations clean up expired entries automatically
   * 
   * Indexes:
   * - by_conversation: Get all typing users in a conversation
   * - by_expires: Clean up expired indicators efficiently
   */
  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    expiresAt: v.number(),               // Auto-expire timestamp
  })
    .index("by_conversation", ["conversationId"])
    .index("by_expires", ["expiresAt"]),

  /**
   * REACTIONS TABLE (Optional - but included for completeness)
   * 
   * Message reactions/emoji
   * 
   * Design: One reaction per user per message
   * 
   * Indexes:
   * - by_message: Get all reactions for a message
   * - by_message_and_user: Update/remove user's reaction
   */
  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),                   // Emoji character
    createdAt: v.number(),               // When reaction was added
  })
    .index("by_message", ["messageId"])
    .index("by_message_and_user", ["messageId", "userId"]),
});

/**
 * INDEX STRATEGY EXPLANATION:
 * 
 * 1. by_clerk_id (users): 
 *    - Used when syncing user from Clerk webhook
 *    - Used when converting clerkId to Convex user ID
 * 
 * 2. by_is_online (users):
 *    - Filter online vs offline users in discovery UI
 *    - Show online contacts first
 * 
 * 3. by_user_id (conversationMembers):
 *    - Primary query: "Show me all my conversations"
 *    - Powers the sidebar conversation list
 * 
 * 4. by_conversation_id (conversationMembers):
 *    - Get all participants of a conversation
 *    - Check if user is member before allowing access
 * 
 * 5. by_conversation_and_user (conversationMembers):
 *    - Update read status for specific user in conversation
 *    - Check individual membership efficiently
 * 
 * 6. by_conversation_created (messages):
 *    - Fetch messages ordered by time (most common)
 *    - Supports pagination if needed
 * 
 * 7. by_conversation (typingIndicators):
 *    - Show who's typing in current conversation
 * 
 * 8. by_expires (typingIndicators):
 *    - Batch cleanup of expired typing indicators
 * 
 * 9. by_message (reactions):
 *    - Show all reactions on a message
 * 
 * All indexes are chosen to support O(log n) lookups for common operations.
 */
