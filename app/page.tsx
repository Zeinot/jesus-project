"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import CategorySection from "@/components/home/CategorySection";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";

function LoadingState() {
  return (
    <div className="min-h-svh w-full">
      {/* Hero skeleton */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-2/3 mx-auto" />
        </div>
      </section>

      {/* Content skeleton */}
      <div className="px-4 md:px-6 max-w-6xl mx-auto space-y-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-svh flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-semibold">No articles yet</h2>
        <p className="text-muted-foreground text-sm">
          We&apos;re fetching articles from our sources. Please wait a moment or check back soon.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const categories = useQuery(api.categories.getCategories);
  const latestArticles = useQuery(api.articles.getLatestArticles, { limit: 6 });

  if (categories === undefined || latestArticles === undefined) {
    return <LoadingState />;
  }

  const hasAnyArticles = latestArticles.length > 0;

  if (!hasAnyArticles && categories.length > 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-svh pb-20 md:pb-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Discover Articles with{" "}
            <span className="text-primary">Credibility Scores</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto"
          >
            Curated articles across politics, psychology, finance, and more.
            Community-validated credibility scores help you find trustworthy content.
          </motion.p>
        </div>
      </section>

      {/* Featured Latest Articles */}
      {latestArticles && latestArticles.length > 0 && (
        <section className="px-4 py-8 md:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-xl font-semibold mb-4">Latest Articles</h2>
            <CategorySection
              articles={latestArticles as Doc<"articles">[]}
              categoryColor="#6B7280"
            />
          </div>
        </section>
      )}

      {/* Category Sections */}
      <div className="px-4 py-4 md:px-6 space-y-10 md:space-y-12">
        <div className="mx-auto max-w-6xl space-y-10 md:space-y-12">
          {categories.map((category: Doc<"categories">, index: number) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <CategorySectionWrapper category={category} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategorySectionWrapper({ category }: { category: Doc<"categories"> }) {
  const articles = useQuery(api.articles.getArticlesByCategory, {
    categoryId: category._id,
    limit: 10,
  });

  if (!articles || articles.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <h2 className="text-lg font-semibold md:text-xl">{category.name}</h2>
        <span className="text-xs text-muted-foreground ml-1">
          {articles.length} articles
        </span>
      </div>
      <CategorySection
        articles={articles as Doc<"articles">[]}
        categoryColor={category.color}
      />
    </div>
  );
}
