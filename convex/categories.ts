import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const CATEGORIES = [
  {
    name: "Political",
    slug: "political",
    description: "Political analysis, policy, and government insights",
    color: "#8B5CF6",
    icon: "government-01",
    sortOrder: 1,
  },
  {
    name: "Statistical",
    slug: "statistical",
    description: "Data analysis, surveys, and research findings",
    color: "#6366F1",
    icon: "chart-02",
    sortOrder: 2,
  },
  {
    name: "Book Smart",
    slug: "book-smart",
    description: "Literary reviews, reading recommendations, and intellectual discourse",
    color: "#F59E0B",
    icon: "book-open-01",
    sortOrder: 3,
  },
  {
    name: "Motivational",
    slug: "motivational",
    description: "Self-improvement, productivity, and inspiring stories",
    color: "#EF4444",
    icon: "star-01",
    sortOrder: 4,
  },
  {
    name: "General Knowledge",
    slug: "general-knowledge",
    description: "Fascinating facts, science, and expanding your horizons",
    color: "#10B981",
    icon: "brain-01",
    sortOrder: 5,
  },
  {
    name: "Conversational",
    slug: "conversational",
    description: "Thought-provoking essays and dialogue-worthy topics",
    color: "#3B82F6",
    icon: "message-circle-01",
    sortOrder: 6,
  },
  {
    name: "Psychological",
    slug: "psychological",
    description: "Mental health, behavioral science, and understanding the mind",
    color: "#EC4899",
    icon: "mindset-01",
    sortOrder: 7,
  },
  {
    name: "Finance",
    slug: "finance",
    description: "Markets, investing, personal finance, and economic trends",
    color: "#14B8A6",
    icon: "coins-01",
    sortOrder: 8,
  },
];

export const clearAllData = internalMutation({
  handler: async (ctx) => {
    // Delete all articles
    const articles = await ctx.db.query("articles").collect();
    for (const article of articles) {
      await ctx.db.delete(article._id);
    }
    
    // Delete all credibility scores
    const scores = await ctx.db.query("credibilityScores").collect();
    for (const score of scores) {
      await ctx.db.delete(score._id);
    }
    
    // Delete all RSS feeds
    const feeds = await ctx.db.query("rssFeeds").collect();
    for (const feed of feeds) {
      await ctx.db.delete(feed._id);
    }
    
    // Delete all categories
    const categories = await ctx.db.query("categories").collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }
    
    return { cleared: true, articlesDeleted: articles.length, feedsDeleted: feeds.length, categoriesDeleted: categories.length };
  },
});

export const seedCategories = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) {
      return { seeded: false, message: "Categories already exist" };
    }

    for (const cat of CATEGORIES) {
      await ctx.db.insert("categories", cat);
    }

    return { seeded: true, count: CATEGORIES.length };
  },
});

export const getCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_sortOrder")
      .collect();
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug")
      .filter((q) => q.eq(q.field("slug"), slug))
      .first();
  },
});
