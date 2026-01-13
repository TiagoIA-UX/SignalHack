-- CreateTable
CREATE TABLE "LegalAcceptance" (
    "id" TEXT NOT NULL,
    "acceptanceId" TEXT,
    "userId" TEXT,
    "email" TEXT,
    "legalVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "termsAccepted" BOOLEAN NOT NULL,
    "privacyAccepted" BOOLEAN NOT NULL,
    "essentialCookiesAccepted" BOOLEAN NOT NULL,
    "metricsConsent" BOOLEAN NOT NULL,
    "personalizationConsent" BOOLEAN NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentEvent" (
    "id" TEXT NOT NULL,
    "acceptanceId" TEXT,
    "userId" TEXT,
    "email" TEXT,
    "legalVersion" TEXT NOT NULL,
    "metrics" BOOLEAN NOT NULL,
    "personalization" BOOLEAN NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LegalAcceptance_userId_idx" ON "LegalAcceptance"("userId");

-- CreateIndex
CREATE INDEX "LegalAcceptance_email_idx" ON "LegalAcceptance"("email");

-- CreateIndex
CREATE INDEX "LegalAcceptance_acceptanceId_idx" ON "LegalAcceptance"("acceptanceId");

-- CreateIndex
CREATE INDEX "LegalAcceptance_legalVersion_idx" ON "LegalAcceptance"("legalVersion");

-- CreateIndex
CREATE INDEX "LegalAcceptance_acceptedAt_idx" ON "LegalAcceptance"("acceptedAt");

-- CreateIndex
CREATE INDEX "ConsentEvent_userId_idx" ON "ConsentEvent"("userId");

-- CreateIndex
CREATE INDEX "ConsentEvent_email_idx" ON "ConsentEvent"("email");

-- CreateIndex
CREATE INDEX "ConsentEvent_acceptanceId_idx" ON "ConsentEvent"("acceptanceId");

-- CreateIndex
CREATE INDEX "ConsentEvent_legalVersion_idx" ON "ConsentEvent"("legalVersion");

-- CreateIndex
CREATE INDEX "ConsentEvent_createdAt_idx" ON "ConsentEvent"("createdAt");
