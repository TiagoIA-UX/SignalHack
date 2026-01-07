-- Add persistent daily Strategist usage (PRO limit enforcement)
ALTER TABLE "UsageDay" ADD COLUMN "insightsUsed" INTEGER NOT NULL DEFAULT 0;
