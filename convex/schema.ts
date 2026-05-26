import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Static categories seeded on deployment
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    color: v.string(),
    icon: v.string(),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"]),

  // RSS feed sources
  rssFeeds: defineTable({
    url: v.string(),
    name: v.string(),
    categoryId: v.id("categories"),
    isActive: v.boolean(),
    lastFetchedAt: v.optional(v.number()),
  })
    .index("by_category", ["categoryId"])
    .index("by_active", ["isActive"]),

  // Articles fetched from RSS
  articles: defineTable({
    title: v.string(),
    summary: v.string(),
    content: v.optional(v.string()),
    url: v.string(),
    imageUrl: v.union(v.string(), v.null()),
    categoryId: v.id("categories"),
    sourceName: v.string(),
    sourceUrl: v.string(),
    publishedAt: v.number(),
    fetchedAt: v.number(),
    upvotes: v.number(),
    downvotes: v.number(),
    computedScore: v.optional(v.number()), // 0-100
  })
    .index("by_category", ["categoryId"])
    .index("by_url", ["url"])
    .index("by_fetchedAt", ["fetchedAt"])
    .index("by_score", ["computedScore"]),

  // LLM + user credibility scores
  credibilityScores: defineTable({
    articleId: v.id("articles"),
    llmScore: v.number(), // 0-100
    llmReasoning: v.optional(v.string()),
    computedScore: v.number(), // weighted final score
    totalVotes: v.number(),
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"]),

  // User votes on article credibility
  userVotes: defineTable({
    userId: v.string(), // Better Auth user ID
    articleId: v.id("articles"),
    vote: v.union(v.literal("up"), v.literal("down")),
    createdAt: v.number(),
  })
    .index("by_user_article", ["userId", "articleId"])
    .index("by_article", ["articleId"]),

  // User-created collections
  collections: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    slug: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"])
    .index("by_slug", ["slug"]),

  // Articles saved to collections (junction)
  collectionArticles: defineTable({
    collectionId: v.id("collections"),
    articleId: v.id("articles"),
    addedAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_article", ["articleId"])
    .index("by_collection_article", ["collectionId", "articleId"]),

  // User preferences for notifications
  userPreferences: defineTable({
    userId: v.string(),
    email: v.string(),
    notifyOnNewArticles: v.boolean(),
    subscribedCategories: v.optional(v.array(v.id("categories"))),
    lastNotifiedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"]),
});
