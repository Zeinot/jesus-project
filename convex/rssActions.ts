import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";
import { XMLParser } from "fast-xml-parser";

// Import RSS sources from JSON config
import rssSources from "../lib/rss-sources.json";

function parseRSSItems(xmlText: string): Array<{
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  enclosure?: { url?: string };
}> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "_text",
  });
  
  const parsed = parser.parse(xmlText);
  
  // Handle RSS 2.0
  const channel = parsed.rss?.channel;
  if (channel && channel.item) {
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    return items.map((item: any) => ({
      title: item.title?._text || item.title || "Untitled",
      link: item.link?._text || item.link || "",
      pubDate: item.pubDate?._text || item.pubDate || item.date?._text || item.date,
      contentSnippet: item.description?._text || item.description || "",
      content: item["content:encoded"]?._text || item["content:encoded"] || item.description?._text || item.description || "",
      enclosure: item.enclosure ? { url: item.enclosure.url || "" } : undefined,
    }));
  }
  
  // Handle Atom
  const feed = parsed.feed;
  if (feed && feed.entry) {
    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    return entries.map((entry: any) => ({
      title: entry.title?._text || entry.title || "Untitled",
      link: entry.link?.href || entry.link?._text || entry.link || "",
      pubDate: entry.updated?._text || entry.updated || entry.published?._text || entry.published,
      contentSnippet: entry.summary?._text || entry.summary || "",
      content: entry.content?._text || entry.content || entry.summary?._text || entry.summary || "",
      enclosure: undefined,
    }));
  }
  
  return [];
}

export const seedRSSFeeds = internalAction({
  handler: async (ctx): Promise<{ seeded: boolean; message?: string; count?: number }> => {
    const categories = await ctx.runQuery(api.categories.getCategories, {});
    const existing = await ctx.runQuery(api.rss.getRSSFeeds, {});
    
    if (existing.length > 0) {
      return { seeded: false, message: "RSS feeds already exist" };
    }

    const catMap = new Map<string, string>(
      categories.map((c: { slug: string; _id: string }) => [c.slug, c._id])
    );

    for (const source of rssSources) {
      const categoryId = catMap.get(source.categorySlug);
      if (categoryId) {
        await ctx.runMutation(api.rss.createRSSFeed, {
          url: source.url,
          name: source.name,
          categoryId: categoryId as any,
        });
      }
    }

    return { seeded: true, count: rssSources.length };
  },
});

export const fetchRSSFeeds = internalAction({
  handler: async (ctx): Promise<Array<{ feed: string; articles?: number; error?: string }>> => {
    const feeds = await ctx.runQuery(api.rss.getRSSFeeds, {});
    const results: Array<{ feed: string; articles?: number; error?: string }> = [];

    for (const feed of feeds) {
      if (!feed.isActive) continue;

      try {
        const response = await fetch(feed.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; RSS Reader)",
          },
        });
        
        if (!response.ok) {
          results.push({ feed: feed.name, error: `HTTP ${response.status}` });
          continue;
        }
        
        const xmlText = await response.text();
        const items = parseRSSItems(xmlText);
        const articles: string[] = [];

        for (const item of items.slice(0, 10)) {
          if (!item.link) continue;
          
          // Deduplicate by URL
          const existing = await ctx.runQuery(api.rss.getArticleByUrl, {
            url: item.link,
          });

          if (existing) continue;

          const articleId = await ctx.runMutation(api.rss.createArticle, {
            title: item.title || "Untitled",
            summary: item.contentSnippet || "",
            content: item.content || item.contentSnippet || "",
            url: item.link,
            imageUrl: item.enclosure?.url || null,
            categoryId: feed.categoryId,
            sourceName: feed.name,
            sourceUrl: feed.url,
            publishedAt: item.pubDate
              ? new Date(item.pubDate).getTime()
              : Date.now(),
          });

          articles.push(articleId);
        }

        await ctx.runMutation(api.rss.updateFeedLastFetched, {
          feedId: feed._id,
        });

        results.push({ feed: feed.name, articles: articles.length });
      } catch (error) {
        results.push({ feed: feed.name, error: String(error) });
      }
    }

    return results;
  },
});
