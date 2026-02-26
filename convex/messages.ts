import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * MESSAGE QUERIES AND MUTATIONS
 * 
 * Core messaging functionality with real-time support
 */

/**
 * Get all messages for a conversation
 * 
 * Returns messages with sender details, ordered by creation time
 */
export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, { conversationId, currentUserId }) => {
    // Verify user is member of conversation
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", conversationId).eq("userId", currentUserId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this conversation");
    }

    // Get messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();

    // Attach sender details
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender,
        };
      })
    );

    return messagesWithSenders;
  },
});

/**
 * Send a new message
 * 
 * Creates message and updates conversation's lastMessageAt
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
  },
  handler: async (ctx, { conversationId, senderId, body }) => {
    // Verify user is member
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", conversationId).eq("userId", senderId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this conversation");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId,
      body: body.trim(),
      createdAt: Date.now(),
      deleted: false,
    });

    // Update conversation's last message time
    await ctx.db.patch(conversationId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Soft delete a message
 * 
 * Sets deleted flag instead of removing from DB
 * Preserves conversation continuity
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, { messageId, userId }) => {
    const message = await ctx.db.get(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Only sender can delete their message
    if (message.senderId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(messageId, {
      deleted: true,
    });
  },
});

/**
 * Add reaction to a message
 */
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, { messageId, userId, emoji }) => {
    // Check if user already reacted to this message
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_message_and_user", (q) =>
        q.eq("messageId", messageId).eq("userId", userId)
      )
      .unique();

    if (existingReaction) {
      // Update existing reaction
      await ctx.db.patch(existingReaction._id, {
        emoji,
      });
      return existingReaction._id;
    } else {
      // Create new reaction
      const reactionId = await ctx.db.insert("reactions", {
        messageId,
        userId,
        emoji,
        createdAt: Date.now(),
      });
      return reactionId;
    }
  },
});

/**
 * Remove reaction from a message
 */
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, { messageId, userId }) => {
    const reaction = await ctx.db
      .query("reactions")
      .withIndex("by_message_and_user", (q) =>
        q.eq("messageId", messageId).eq("userId", userId)
      )
      .unique();

    if (reaction) {
      await ctx.db.delete(reaction._id);
    }
  },
});

/**
 * Get reactions for a message
 */
export const getMessageReactions = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, { messageId }) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", messageId))
      .collect();

    // Group by emoji
    const grouped = reactions.reduce((acc, reaction) => {
      const existing = acc.find((r) => r.emoji === reaction.emoji);
      if (existing) {
        existing.count++;
        existing.userIds.push(reaction.userId);
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          userIds: [reaction.userId],
        });
      }
      return acc;
    }, [] as Array<{ emoji: string; count: number; userIds: typeof reactions[number]["userId"][] }>);

    return grouped;
  },
});
