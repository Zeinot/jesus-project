"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, BookOpen, Check, Loader2 } from "lucide-react";
import Link from "next/link";

interface SaveToCollectionButtonProps {
  articleId: string;
}

export default function SaveToCollectionButton({
  articleId,
}: SaveToCollectionButtonProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCollectionId, setSavedCollectionId] = useState<string | null>(null);

  const collections = useQuery(
    api.collections.getUserCollections,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  const addToCollection = useMutation(api.collections.addArticleToCollection);

  const handleSave = async (collectionId: string) => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }
    setSaving(true);
    await addToCollection({ collectionId: collectionId as any, articleId: articleId as any });
    setSaving(false);
    setSavedCollectionId(collectionId);
    setTimeout(() => {
      setSavedCollectionId(null);
      setOpen(false);
    }, 1200);
  };

  if (!session?.user?.id) {
    return (
      <Button
        variant="outline"
        className="w-full sm:w-auto gap-2"
        onClick={() => router.push("/signin")}
      >
        <BookOpen className="h-4 w-4" />
        Save to collection
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto gap-2">
          <BookOpen className="h-4 w-4" />
          Save to collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to collection</DialogTitle>
          <DialogDescription>
            Choose a collection to save this article to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
          {collections === undefined ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : collections.length === 0 ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any collections yet.
              </p>
              <Button asChild size="sm">
                <Link href="/collections">Create collection</Link>
              </Button>
            </div>
          ) : (
            collections.map((collection: any) => {
              const isSaved = savedCollectionId === collection._id;
              return (
                <Button
                  key={collection._id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleSave(collection._id)}
                  disabled={saving || !!savedCollectionId}
                >
                  {isSaved ? (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : saving ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0" />
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {collection.name}
                    </p>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  {isSaved && (
                    <span className="text-xs text-emerald-500 font-medium">Saved</span>
                  )}
                </Button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
