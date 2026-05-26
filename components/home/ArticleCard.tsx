"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Doc } from "@/convex/_generated/dataModel";
import CredibilityBadge from "./CredibilityBadge";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/<script[^>]*>.*?<\/script>/gs, "")
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

interface ArticleCardProps {
  article: Doc<"articles">;
  categoryColor: string;
}

export default function ArticleCard({ article, categoryColor }: ArticleCardProps) {
  const score = article.computedScore ?? 50;
  const cleanSummary = stripHtml(article.summary);
  
  return (
    <Link href={`/article/${article._id}`}>
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm hover:shadow-md transition-shadow h-full"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div 
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: `${categoryColor}15` }}
            >
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ color: categoryColor, backgroundColor: `${categoryColor}20` }}
              >
                No image
              </span>
            </div>
          )}
          
          {/* Credibility Badge */}
          <div className="absolute top-2 right-2">
            <CredibilityBadge score={score} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors md:text-base">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">
            {cleanSummary}
          </p>
          
          {/* Footer */}
          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[60%]">{article.sourceName}</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
