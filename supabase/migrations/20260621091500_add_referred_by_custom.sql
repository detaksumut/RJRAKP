-- Migration: Add referred_by_custom column to users table
-- This allows submitters to manually enter their referrer's name if the referrer is not yet registered.

ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_custom VARCHAR(255) DEFAULT NULL;
