import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getArticlesByCategory = query({
  args: {
    categoryId: v.id("categories"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { categoryId, limit = 20 }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_category")
      .filter((q) => q.eq(q.field("categoryId"), categoryId))
      .order("desc")
      .take(limit);
  },
});

export const getLatestArticles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(limit);
  },
});

export const getArticleById = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, { articleId }) => {
    return await ctx.db.get(articleId);
  },
});

export const searchArticles = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query: searchQuery, limit = 20 }) => {
    const lowerQuery = searchQuery.toLowerCase();
    const allArticles = await ctx.db.query("articles").take(100);
    return allArticles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(lowerQuery) ||
          a.summary.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  },
});
