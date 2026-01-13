-- Add PASSWORD_RESET to AuthTokenType enum
ALTER TYPE "AuthTokenType" RENAME TO "AuthTokenType_old";

CREATE TYPE "AuthTokenType" AS ENUM ('MAGIC_LINK', 'PASSWORD_RESET');

-- O Postgres não consegue fazer cast automático do DEFAULT antigo para o novo enum.
-- Então removemos o default antes do ALTER TYPE e restauramos depois.
ALTER TABLE "AuthToken" ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "AuthToken" ALTER COLUMN "type" TYPE "AuthTokenType" USING ("type"::text::"AuthTokenType");

ALTER TABLE "AuthToken" ALTER COLUMN "type" SET DEFAULT 'MAGIC_LINK'::"AuthTokenType";

DROP TYPE "AuthTokenType_old";