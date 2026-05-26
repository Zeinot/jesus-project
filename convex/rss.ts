import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRSSFeeds = query({
  handler: async (ctx) => {
    return await ctx.db.query("rssFeeds").collect();
  },
});

export const createRSSFeed = mutation({
  args: {
    url: v.string(),
    name: v.string(),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rssFeeds", {
      ...args,
      isActive: true,
    });
  },
});

export const getArticleByUrl = query({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_url")
      .filter((q) => q.eq(q.field("url"), url))
      .first();
  },
});

export const createArticle = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    content: v.optional(v.string()),
    url: v.string(),
    imageUrl: v.union(v.string(), v.null()),
    categoryId: v.id("categories"),
    sourceName: v.string(),
    sourceUrl: v.string(),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const articleId = await ctx.db.insert("articles", {
      ...args,
      fetchedAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
    });

    // Create initial credibility score
    await ctx.db.insert("credibilityScores", {
      articleId,
      llmScore: 50,
      llmReasoning: "Pending analysis",
      computedScore: 50,
      totalVotes: 0,
      createdAt: Date.now(),
    });

    return articleId;
  },
});

export const updateFeedLastFetched = mutation({
  args: { feedId: v.id("rssFeeds") },
  handler: async (ctx, { feedId }) => {
    await ctx.db.patch(feedId, {
      lastFetchedAt: Date.now(),
    });
  },
});
