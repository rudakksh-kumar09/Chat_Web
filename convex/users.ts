import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * USER QUERIES AND MUTATIONS
 * 
 * Handles user management and presence
 */

/**
 * Get current user by Clerk ID
 */
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    return user;
  },
});

/**
 * Create or update user (client-callable for development)
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        isOnline: false,
        lastSeen: Date.now(),
      });
      const newUser = await ctx.db.get(userId);
      return newUser;
    }
  },
});

/**
 * Get user by Convex ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

/**
 * List all users except the current user (for user discovery)
 */
export const listUsers = query({
  args: { 
    currentUserId: v.id("users"),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, { currentUserId, searchQuery }) => {
    let users = await ctx.db.query("users").collect();

    // Exclude current user
    users = users.filter((user) => user._id !== currentUserId);

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Sort: online users first, then by name
    users.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });

    return users;
  },
});

/**
 * Update user online status
 */
export const updatePresence = mutation({
  args: {
    userId: v.id("users"),
    isOnline: v.boolean(),
  },
  handler: async (ctx, { userId, isOnline }) => {
    await ctx.db.patch(userId, {
      isOnline,
      lastSeen: Date.now(),
    });
  },
});

/**
 * Sync user from Clerk (called by webhook)
 * Internal mutation - only callable from backend
 */
export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        isOnline: false,
        lastSeen: Date.now(),
      });
      return userId;
    }
  },
});

/**
 * Delete user (called by webhook when user deleted in Clerk)
 */
export const deleteUser = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
