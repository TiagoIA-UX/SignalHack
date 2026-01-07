-- Add PASSWORD_RESET to AuthTokenType enum
ALTER TYPE "AuthTokenType" RENAME TO "AuthTokenType_old";

CREATE TYPE "AuthTokenType" AS ENUM ('MAGIC_LINK', 'PASSWORD_RESET');

ALTER TABLE "AuthToken" ALTER COLUMN "type" TYPE "AuthTokenType" USING ("type"::text::"AuthTokenType");

DROP TYPE "AuthTokenType_old";