-- CreateIndex
CREATE INDEX "Novel_userId_updatedAt_idx" ON "Novel"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Novel_userId_createdAt_idx" ON "Novel"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
