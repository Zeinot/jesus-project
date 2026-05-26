import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCredibilityScore = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, { articleId }) => {
    return await ctx.db
      .query("credibilityScores")
      .withIndex("by_article")
      .filter((q) => q.eq(q.field("articleId"), articleId))
      .first();
  },
});

export const getUserVote = query({
  args: {
    userId: v.string(),
    articleId: v.id("articles"),
  },
  handler: async (ctx, { userId, articleId }) => {
    return await ctx.db
      .query("userVotes")
      .withIndex("by_user_article")
      .filter(
        (q) =>
          q.eq(q.field("userId"), userId) &&
          q.eq(q.field("articleId"), articleId)
      )
      .first();
  },
});

export const voteCredibility = mutation({
  args: {
    userId: v.string(),
    articleId: v.id("articles"),
    vote: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, { userId, articleId, vote }) => {
    const existingVote = await ctx.db
      .query("userVotes")
      .withIndex("by_user_article")
      .filter(
        (q) =>
          q.eq(q.field("userId"), userId) &&
          q.eq(q.field("articleId"), articleId)
      )
      .first();

    const article = await ctx.db.get(articleId);
    if (!article) throw new Error("Article not found");

    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (existingVote) {
      // Remove old vote
      if (existingVote.vote === "up") {
        upvoteDelta -= 1;
      } else {
        downvoteDelta -= 1;
      }

      if (existingVote.vote === vote) {
        // Same vote = toggle off
        await ctx.db.delete(existingVote._id);
      } else {
        // Different vote = change
        await ctx.db.patch(existingVote._id, { vote });
        if (vote === "up") {
          upvoteDelta += 1;
        } else {
          downvoteDelta += 1;
        }
      }
    } else {
      // New vote
      await ctx.db.insert("userVotes", {
        userId,
        articleId,
        vote,
        createdAt: Date.now(),
      });
      if (vote === "up") {
        upvoteDelta += 1;
      } else {
        downvoteDelta += 1;
      }
    }

    // Update article vote counts
    await ctx.db.patch(articleId, {
      upvotes: article.upvotes + upvoteDelta,
      downvotes: article.downvotes + downvoteDelta,
    });

    // Recalculate credibility score
    const scoreDoc = await ctx.db
      .query("credibilityScores")
      .withIndex("by_article")
      .filter((q) => q.eq(q.field("articleId"), articleId))
      .first();

    if (scoreDoc) {
      const totalVotes = article.upvotes + upvoteDelta + article.downvotes + downvoteDelta;
      const userScore = totalVotes > 0
        ? ((article.upvotes + upvoteDelta) / totalVotes) * 100
        : 50;
      
      // Weighted: 60% LLM + 40% user votes
      const newComputedScore = Math.round(
        scoreDoc.llmScore * 0.6 + userScore * 0.4
      );

      await ctx.db.patch(scoreDoc._id, {
        computedScore: newComputedScore,
        totalVotes: totalVotes,
      });

      await ctx.db.patch(articleId, {
        computedScore: newComputedScore,
      });
    }

    return true;
  },
});
