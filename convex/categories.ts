import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const CATEGORIES = [
  {
    name: "Political Statistical",
    slug: "political-statistical",
    description: "Data-driven political analysis and statistical insights",
    color: "#8B5CF6",
    icon: "chart-01",
    sortOrder: 1,
  },
  {
    name: "Book Smart",
    slug: "book-smart",
    description: "Literary reviews, reading recommendations, and intellectual discourse",
    color: "#F59E0B",
    icon: "book-open-01",
    sortOrder: 2,
  },
  {
    name: "Motivational",
    slug: "motivational",
    description: "Self-improvement, productivity, and inspiring stories",
    color: "#EF4444",
    icon: "star-01",
    sortOrder: 3,
  },
  {
    name: "General Knowledge",
    slug: "general-knowledge",
    description: "Fascinating facts, science, and expanding your horizons",
    color: "#10B981",
    icon: "brain-01",
    sortOrder: 4,
  },
  {
    name: "Conversational",
    slug: "conversational",
    description: "Thought-provoking essays and dialogue-worthy topics",
    color: "#3B82F6",
    icon: "message-circle-01",
    sortOrder: 5,
  },
  {
    name: "Psychological",
    slug: "psychological",
    description: "Mental health, behavioral science, and understanding the mind",
    color: "#EC4899",
    icon: "mindset-01",
    sortOrder: 6,
  },
  {
    name: "Finance",
    slug: "finance",
    description: "Markets, investing, personal finance, and economic trends",
    color: "#14B8A6",
    icon: "coins-01",
    sortOrder: 7,
  },
];

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
