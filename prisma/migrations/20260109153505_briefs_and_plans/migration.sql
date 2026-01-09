-- CreateTable
CREATE TABLE "ExecutionPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "experiment" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyBrief" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExecutionPlan_userId_idx" ON "ExecutionPlan"("userId");

-- CreateIndex
CREATE INDEX "ExecutionPlan_signalId_idx" ON "ExecutionPlan"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionPlan_userId_signalId_key" ON "ExecutionPlan"("userId", "signalId");

-- CreateIndex
CREATE INDEX "WeeklyBrief_userId_idx" ON "WeeklyBrief"("userId");

-- CreateIndex
CREATE INDEX "WeeklyBrief_weekStart_idx" ON "WeeklyBrief"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyBrief_userId_weekStart_key" ON "WeeklyBrief"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyBrief" ADD CONSTRAINT "WeeklyBrief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
