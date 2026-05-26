"use client";

import { motion } from "framer-motion";

interface CredibilityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 86) return "#10B981"; // Emerald
  if (score >= 61) return "#14B8A6"; // Teal
  if (score >= 31) return "#F59E0B"; // Amber
  return "#EF4444"; // Red
}

function getScoreLabel(score: number): string {
  if (score >= 86) return "Excellent";
  if (score >= 61) return "Good";
  if (score >= 31) return "Fair";
  return "Low";
}

export default function CredibilityBadge({
  score,
  size = "md",
  showLabel = false,
}: CredibilityBadgeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const sizeClasses = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-12 w-12 text-xs",
    lg: "h-20 w-20 text-sm",
  };

  const ringWidth = {
    sm: 2.5,
    md: 3,
    lg: 4,
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth={ringWidth[size]}
            className="text-muted/20"
          />
          {/* Score ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth={ringWidth[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
          />
        </svg>
        
        {/* Score text */}
        <span className="relative z-10 font-bold tabular-nums" style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
      
      {showLabel && (
        <span className="text-[10px] font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
