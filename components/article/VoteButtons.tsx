"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface VoteButtonsProps {
  userVote: "up" | "down" | null;
  onVote: (vote: "up" | "down") => void;
  disabled?: boolean;
}

export default function VoteButtons({ userVote, onVote, disabled }: VoteButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant={userVote === "up" ? "default" : "outline"}
          size="sm"
          onClick={() => onVote("up")}
          disabled={disabled}
          className="gap-1.5"
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="hidden sm:inline">Trustworthy</span>
        </Button>
      </motion.div>
      
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant={userVote === "down" ? "destructive" : "outline"}
          size="sm"
          onClick={() => onVote("down")}
          disabled={disabled}
          className="gap-1.5"
        >
          <ThumbsDown className="h-4 w-4" />
          <span className="hidden sm:inline">Questionable</span>
        </Button>
      </motion.div>
    </div>
  );
}
