import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Fetch RSS feeds every 30 minutes
crons.interval(
  "fetch rss feeds",
  { minutes: 30 },
  internal.rssActions.fetchRSSFeeds,
  {}
);

export default crons;
