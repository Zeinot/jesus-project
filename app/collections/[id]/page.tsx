"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Globe, Lock } from "lucide-react";
import ArticleCard from "@/components/home/ArticleCard";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const collection = useQuery(api.collections.getCollectionById, {
    collectionId: collectionId as any,
  });

  if (collection === undefined) {
    return (
      <div className="min-h-svh p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-svh flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Collection not found</h1>
          <Button asChild>
            <Link href="/collections">My collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            {collection.isPublic ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {collection.description && (
            <p className="text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {collection.articles?.length || 0} article
            {(collection.articles?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>

        {collection.articles && collection.articles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collection.articles.map((article: any) => (
              <ArticleCard
                key={article._id}
                article={article}
                categoryColor="#6B7280"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles in this collection yet.</p>
            <Button asChild className="mt-4">
              <Link href="/">Browse articles</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
