"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CredibilityBadge from "@/components/home/CredibilityBadge";
import VoteButtons from "@/components/article/VoteButtons";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import SaveToCollectionButton from "@/components/article/SaveToCollectionButton";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as Id<"articles">;
  
  const article = useQuery(api.articles.getArticleById, { articleId });
  const score = useQuery(api.credibility.getCredibilityScore, { articleId });
  const { data: session } = authClient.useSession();
  
  const userVote = useQuery(
    api.credibility.getUserVote,
    session?.user?.id ? { userId: session.user.id, articleId } : "skip"
  );

  const voteMutation = useMutation(api.credibility.voteCredibility);

  const [voting, setVoting] = useState(false);

  const handleVote = async (vote: "up" | "down") => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }
    setVoting(true);
    await voteMutation({
      userId: session.user.id,
      articleId,
      vote,
    });
    setVoting(false);
  };

  if (article === undefined || score === undefined) {
    return (
      <div className="min-h-svh p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-svh flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Article not found</h1>
          <p className="text-muted-foreground">
            The article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const cleanSummary = stripHtml(article.summary);

  return (
    <div className="min-h-svh pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {/* Article header */}
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Title and meta */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {article.sourceName}
              </span>
              <span>&middot;</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              <span>&middot;</span>
              <span>{article.fetchedAt ? "Verified source" : ""}</span>
            </div>
          </div>

          {/* Featured image */}
          {article.imageUrl && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Credibility Score Section */}
          {score && (
            <div className="rounded-xl border border-border/50 bg-card p-4 md:p-6">
              <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                <div className="flex items-center gap-4">
                  <CredibilityBadge
                    score={score.computedScore}
                    size="lg"
                    showLabel
                  />
                  <div className="text-center md:text-left">
                    <h3 className="font-semibold">Credibility Score</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on LLM analysis and {score.totalVotes} community votes
                    </p>
                  </div>
                </div>
                
                <VoteButtons
                  userVote={userVote?.vote || null}
                  onVote={handleVote}
                  disabled={voting}
                />
              </div>

              {score.llmReasoning && score.llmReasoning !== "Pending analysis" && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {score.llmReasoning}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {cleanSummary && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-base leading-relaxed text-foreground/90 md:text-lg">
                {cleanSummary}
              </p>
            </div>
          )}

          {/* Content */}
          {article.content && article.content !== article.summary && (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-6 border-t border-border/50 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Read original article
              </a>
            </Button>
            <SaveToCollectionButton articleId={article._id} />
          </div>
        </motion.article>
      </div>
    </div>
  );
}
