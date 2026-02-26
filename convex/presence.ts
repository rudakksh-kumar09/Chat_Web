import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * PRESENCE SYSTEM
 * 
 * Tracks online/offline status with heartbeat mechanism
 * 
 * Design:
 * - Client sends heartbeat every 30 seconds while active
 * - Status set to offline after 45 seconds without heartbeat
 * - lastSeen timestamp updated on every heartbeat
 */

/**
 * Send heartbeat to mark user as online
 * 
 * Should be called:
 * - On app mount
 * - Every 30 seconds while app is active
 * - Before page unload (set offline)
 */
export const heartbeat = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    
    if (!user) return;

    await ctx.db.patch(userId, {
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

/**
 * Mark user as offline
 */
export const setOffline = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    
    if (!user) return;

    await ctx.db.patch(userId, {
      isOnline: false,
      lastSeen: Date.now(),
    });
  },
});

/**
 * Get presence status for a user
 */
export const getUserPresence = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    
    if (!user) return null;

    return {
      userId: user._id,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    };
  },
});

/**
 * Get presence for multiple users
 */
export const getBatchPresence = query({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, { userIds }) => {
    const users = await Promise.all(
      userIds.map((id) => ctx.db.get(id))
    );

    return users
      .filter((u): u is NonNullable<typeof u> => u !== null && u !== undefined)
      .map((user) => ({
        userId: user._id,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      }));
  },
});
