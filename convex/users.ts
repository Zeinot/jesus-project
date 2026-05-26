import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserPreferences = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});

export const updateUserPreferences = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    notifyOnNewArticles: v.optional(v.boolean()),
    subscribedCategories: v.optional(v.array(v.id("categories"))),
  },
  handler: async (ctx, { userId, ...updates }) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId,
        email: updates.email || "",
        notifyOnNewArticles: updates.notifyOnNewArticles ?? false,
        subscribedCategories: updates.subscribedCategories || [],
        lastNotifiedAt: Date.now(),
      });
    }
  },
});
