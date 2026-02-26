import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * TYPING INDICATORS
 * 
 * Real-time typing status with auto-expiration
 * 
 * Design: Each typing indicator expires after 2 seconds
 * Client should send updates every ~1 second while typing
 */

const TYPING_TIMEOUT_MS = 2000; // 2 seconds

/**
 * Set typing status for user in conversation
 * 
 * Auto-expires after TYPING_TIMEOUT_MS
 */
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, { conversationId, userId }) => {
    const expiresAt = Date.now() + TYPING_TIMEOUT_MS;

    // Check if indicator already exists
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (existing) {
      // Update expiration time
      await ctx.db.patch(existing._id, {
        expiresAt,
      });
    } else {
      // Create new indicator
      await ctx.db.insert("typingIndicators", {
        conversationId,
        userId,
        expiresAt,
      });
    }

    // Clean up expired indicators
    await cleanupExpiredIndicators(ctx);
  },
});

/**
 * Get all users currently typing in a conversation
 * 
 * Excludes current user and expired indicators
 */
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, { conversationId, currentUserId }) => {
    const now = Date.now();

    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .filter((q) =>
        q.and(
          q.neq(q.field("userId"), currentUserId),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .collect();

    // Get user details
    const users = await Promise.all(
      indicators.map((indicator) => ctx.db.get(indicator.userId))
    );

    return users.filter((u): u is NonNullable<typeof u> => u !== null && u !== undefined);
  },
});

/**
 * Stop typing (remove indicator)
 */
export const stopTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, { conversationId, userId }) => {
    const indicator = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (indicator) {
      await ctx.db.delete(indicator._id);
    }
  },
});

/**
 * Internal helper to clean up expired typing indicators
 */
async function cleanupExpiredIndicators(ctx: any) {
  const now = Date.now();
  
  const expired = await ctx.db
    .query("typingIndicators")
    .withIndex("by_expires", (q: any) => q.lt("expiresAt", now))
    .collect();

  await Promise.all(expired.map((indicator: any) => ctx.db.delete(indicator._id)));
}
