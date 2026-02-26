import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * CONVERSATION QUERIES AND MUTATIONS
 * 
 * Handles conversation creation and management
 */

/**
 * Get or create a DM conversation between two users
 * 
 * Logic: Check if conversation already exists between these two users
 * If yes, return it. If no, create new one.
 */
export const getOrCreateDM = mutation({
  args: {
    currentUserId: v.id("users"),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, { currentUserId, otherUserId }) => {
    // Find all DM conversations for current user
    const currentUserMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", currentUserId))
      .collect();

    // Check each conversation to see if it's a DM with the other user
    for (const membership of currentUserMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      
      if (!conversation || conversation.isGroup) continue;

      // Check if other user is in this conversation
      const otherMembership = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation_and_user", (q) =>
          q.eq("conversationId", membership.conversationId).eq("userId", otherUserId)
        )
        .unique();

      if (otherMembership) {
        // Found existing DM conversation
        return membership.conversationId;
      }
    }

    // No existing conversation found, create new one
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      createdAt: Date.now(),
    });

    // Add both users as members
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: currentUserId,
      joinedAt: Date.now(),
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: otherUserId,
      joinedAt: Date.now(),
    });

    return conversationId;
  },
});

/**
 * Create a group conversation
 * 
 * Creates a group chat with multiple members and a name
 */
export const createGroup = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
    creatorId: v.id("users"),
  },
  handler: async (ctx, { name, memberIds, creatorId }) => {
    // Ensure creator is in the member list
    const allMemberIds = memberIds.includes(creatorId) 
      ? memberIds 
      : [creatorId, ...memberIds];

    // Must have at least 3 members for a group
    if (allMemberIds.length < 2) {
      throw new Error("Group must have at least 2 members");
    }

    // Create the conversation
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: name.trim() || "Unnamed Group",
      createdAt: Date.now(),
    });

    // Add all members
    await Promise.all(
      allMemberIds.map((userId) =>
        ctx.db.insert("conversationMembers", {
          conversationId,
          userId,
          joinedAt: Date.now(),
        })
      )
    );

    return conversationId;
  },
});

/**
 * Get all conversations for current user with details
 */
export const listUserConversations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    // Get all conversation memberships for user
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    // Fetch details for each conversation
    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        // Get all members
        const allMembers = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation_id", (q) =>
            q.eq("conversationId", membership.conversationId)
          )
          .collect();

        // Get user details for members
        const memberUsers = await Promise.all(
          allMembers.map((m) => ctx.db.get(m.userId))
        );

        // For DMs, get the other user
        const otherUser = conversation.isGroup
          ? null
          : memberUsers.find((u) => u?._id !== userId) ?? null;

        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation_created", (q) =>
            q.eq("conversationId", membership.conversationId)
          )
          .order("desc")
          .first();

        // Calculate unread count
        let unreadCount = 0;
        if (lastMessage && membership.lastReadMessageId) {
          const lastReadMessage = await ctx.db.get(membership.lastReadMessageId);
          const lastReadTime = lastReadMessage?._creationTime ?? 0;
          
          const messagesAfterLastRead = await ctx.db
            .query("messages")
            .withIndex("by_conversation_id", (q) =>
              q.eq("conversationId", membership.conversationId)
            )
            .filter((q) => 
              q.and(
                q.neq(q.field("senderId"), userId),
                q.gt(q.field("_creationTime"), lastReadTime)
              )
            )
            .collect();
          unreadCount = messagesAfterLastRead.length;
        } else if (lastMessage && !membership.lastReadMessageId) {
          const allMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation_id", (q) =>
              q.eq("conversationId", membership.conversationId)
            )
            .filter((q) => q.neq(q.field("senderId"), userId))
            .collect();
          unreadCount = allMessages.length;
        }

        return {
          ...conversation,
          otherUser,
          members: memberUsers.filter((u): u is NonNullable<typeof u> => u !== null && u !== undefined),
          lastMessage: lastMessage ?? undefined,
          unreadCount,
          membership,
        };
      })
    );

    // Filter out null values and sort by last message time
    const validConversations = conversations.filter((c): c is NonNullable<typeof c> => c !== null);
    
    validConversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? a.createdAt;
      const bTime = b.lastMessage?.createdAt ?? b.createdAt;
      return bTime - aTime;
    });

    return validConversations;
  },
});

/**
 * Get conversation details by ID
 */
export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, { conversationId, currentUserId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) return null;

    // Verify user is a member
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", conversationId).eq("userId", currentUserId)
      )
      .unique();

    if (!membership) return null;

    // Get all members
    const allMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_id", (q) => q.eq("conversationId", conversationId))
      .collect();

    const memberUsers = await Promise.all(
      allMembers.map((m) => ctx.db.get(m.userId))
    );

    const otherUser = conversation.isGroup
      ? null
      : memberUsers.find((u) => u?._id !== currentUserId) ?? null;

    return {
      ...conversation,
      otherUser,
      members: memberUsers.filter((u): u is NonNullable<typeof u> => u !== null && u !== undefined),
    };
  },
});

/**
 * Mark conversation as read (update lastReadMessageId)
 */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, { conversationId, userId, messageId }) => {
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", conversationId).eq("userId", userId)
      )
      .unique();

    if (membership) {
      await ctx.db.patch(membership._id, {
        lastReadMessageId: messageId,
      });
    }
  },
});
