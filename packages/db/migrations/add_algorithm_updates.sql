-- Migration: Add Algorithm Update Tracking System
-- Generated: 2024-11-09
-- Description: Adds AlgorithmUpdate model with enums for tracking SEO, AIO, and LinkedIn algorithm updates

-- Create enums
CREATE TYPE "AlgorithmSource" AS ENUM ('SEO', 'AIO', 'LINKEDIN');
CREATE TYPE "UpdateImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create algorithm_updates table
CREATE TABLE "algorithm_updates" (
    "id" TEXT NOT NULL,
    "source" "AlgorithmSource" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT[],
    "impact" "UpdateImpact" NOT NULL,
    "platform" TEXT,
    "analyzed" BOOLEAN NOT NULL DEFAULT false,
    "insights" JSONB,
    "promptUpdates" TEXT,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "appliedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "algorithm_updates_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "algorithm_updates_source_publishedAt_idx" ON "algorithm_updates"("source", "publishedAt");
CREATE INDEX "algorithm_updates_applied_analyzed_idx" ON "algorithm_updates"("applied", "analyzed");

-- Create unique constraint on URL to prevent duplicates
CREATE UNIQUE INDEX "algorithm_updates_url_key" ON "algorithm_updates"("url");
