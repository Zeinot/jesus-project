import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserCollections = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("collections")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

export const getCollectionById = query({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { collectionId }) => {
    const collection = await ctx.db.get(collectionId);
    if (!collection) return null;

    const items = await ctx.db
      .query("collectionArticles")
      .withIndex("by_collection")
      .filter((q) => q.eq(q.field("collectionId"), collectionId))
      .collect();

    const articles = [];
    for (const item of items) {
      const article = await ctx.db.get(item.articleId);
      if (article) {
        articles.push({ ...article, addedAt: item.addedAt });
      }
    }

    return { ...collection, articles };
  },
});

export const getPublicCollections = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query("collections")
      .withIndex("by_public")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(limit);
  },
});

export const createCollection = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const slug = `${args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    return await ctx.db.insert("collections", {
      ...args,
      slug,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { collectionId, ...updates }) => {
    await ctx.db.patch(collectionId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return collectionId;
  },
});

export const deleteCollection = mutation({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { collectionId }) => {
    // Delete all collectionArticles first
    const items = await ctx.db
      .query("collectionArticles")
      .withIndex("by_collection")
      .filter((q) => q.eq(q.field("collectionId"), collectionId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(collectionId);
    return collectionId;
  },
});

export const addArticleToCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    articleId: v.id("articles"),
  },
  handler: async (ctx, { collectionId, articleId }) => {
    const existing = await ctx.db
      .query("collectionArticles")
      .withIndex("by_collection_article")
      .filter(
        (q) =>
          q.eq(q.field("collectionId"), collectionId) &&
          q.eq(q.field("articleId"), articleId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("collectionArticles", {
      collectionId,
      articleId,
      addedAt: Date.now(),
    });
  },
});

export const removeArticleFromCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    articleId: v.id("articles"),
  },
  handler: async (ctx, { collectionId, articleId }) => {
    const existing = await ctx.db
      .query("collectionArticles")
      .withIndex("by_collection_article")
      .filter(
        (q) =>
          q.eq(q.field("collectionId"), collectionId) &&
          q.eq(q.field("articleId"), articleId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return true;
  },
});
