"use client";

import { motion } from "framer-motion";
import ArticleCard from "./ArticleCard";
import { Doc } from "@/convex/_generated/dataModel";

interface CategorySectionProps {
  articles: Doc<"articles">[];
  categoryColor: string;
}

export default function CategorySection({ articles, categoryColor }: CategorySectionProps) {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {articles.map((article: Doc<"articles">, index: number) => (
          <motion.div
            key={article._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ArticleCard article={article} categoryColor={categoryColor} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
