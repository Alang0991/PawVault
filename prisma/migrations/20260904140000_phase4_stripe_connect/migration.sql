-- Phase 4: Stripe Connect + marketplace payments

-- AlterTable: Order
ALTER TABLE "Order"
  ADD COLUMN "orderGroupId" TEXT,
  ADD COLUMN "creatorId" TEXT,
  ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "checkoutSessionId" TEXT,
  ADD COLUMN "stripeAccountId" TEXT,
  ADD COLUMN "applicationFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "refundedAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- AlterTable: OrderItem
ALTER TABLE "OrderItem"
  ADD COLUMN "creatorEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "platformFeeShare" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "contentRatingSnapshot" TEXT;

-- AlterTable: Payment
ALTER TABLE "Payment"
  ADD COLUMN "amountRefunded" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "providerChargeId" TEXT,
  ADD COLUMN "stripeAccountId" TEXT,
  ADD COLUMN "applicationFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "failureCode" TEXT,
  ADD COLUMN "failureMessage" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "provider" SET DEFAULT 'stripe';

-- AlterTable: Refund
ALTER TABLE "Refund"
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "paymentId" TEXT,
  ADD COLUMN "providerRefundId" TEXT,
  ADD COLUMN "stripeAccountId" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "provider" SET DEFAULT 'stripe';

-- CreateTable: OrderGroup
CREATE TABLE "OrderGroup" (
  "id" TEXT NOT NULL,
  "buyerId" TEXT,
  "creatorCount" INTEGER NOT NULL DEFAULT 0,
  "itemCount" INTEGER NOT NULL DEFAULT 0,
  "subtotal" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable: StripeConnectedAccount
CREATE TABLE "StripeConnectedAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeAccountId" TEXT NOT NULL,
  "accountType" TEXT NOT NULL DEFAULT 'express',
  "country" TEXT,
  "defaultCurrency" TEXT,
  "emailOnAccount" TEXT,
  "businessType" TEXT,
  "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
  "capabilities" TEXT,
  "requirementsCurrentlyDue" TEXT,
  "requirementsEventuallyDue" TEXT,
  "requirementsDisabledReason" TEXT,
  "isRestricted" BOOLEAN NOT NULL DEFAULT false,
  "isDisabled" BOOLEAN NOT NULL DEFAULT false,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "disconnectedAt" TIMESTAMP(3),
  "lastSyncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StripeConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable: StripeWebhookEvent
CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "stripeEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "apiVersion" TEXT,
  "livemode" BOOLEAN NOT NULL DEFAULT false,
  "accountId" TEXT,
  "endpoint" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROCESSING',
  "payload" TEXT NOT NULL,
  "errorCategory" TEXT,
  "errorMessage" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: StripeDispute
CREATE TABLE "StripeDispute" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "orderId" TEXT,
  "stripeDisputeId" TEXT NOT NULL,
  "stripeChargeId" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEEDS_RESPONSE',
  "evidenceDueBy" TIMESTAMP(3),
  "isChargeRefundable" BOOLEAN NOT NULL DEFAULT false,
  "raw" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StripeDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PlatformConfig
CREATE TABLE "PlatformConfig" (
  "id" TEXT NOT NULL DEFAULT 'singleton',
  "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "moderatorFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "serverFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "stripeConnectEnabled" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkoutSessionId_key" ON "Order"("checkoutSessionId");
CREATE INDEX "Order_creatorId_idx" ON "Order"("creatorId");
CREATE INDEX "Order_orderGroupId_idx" ON "Order"("orderGroupId");
CREATE INDEX "Order_checkoutSessionId_idx" ON "Order"("checkoutSessionId");

CREATE INDEX "OrderGroup_buyerId_idx" ON "OrderGroup"("buyerId");
CREATE INDEX "OrderGroup_status_idx" ON "OrderGroup"("status");

CREATE UNIQUE INDEX "StripeConnectedAccount_userId_key" ON "StripeConnectedAccount"("userId");
CREATE UNIQUE INDEX "StripeConnectedAccount_stripeAccountId_key" ON "StripeConnectedAccount"("stripeAccountId");
CREATE INDEX "StripeConnectedAccount_stripeAccountId_idx" ON "StripeConnectedAccount"("stripeAccountId");
CREATE INDEX "StripeConnectedAccount_chargesEnabled_idx" ON "StripeConnectedAccount"("chargesEnabled");
CREATE INDEX "StripeConnectedAccount_payoutsEnabled_idx" ON "StripeConnectedAccount"("payoutsEnabled");

CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");
CREATE INDEX "StripeWebhookEvent_type_idx" ON "StripeWebhookEvent"("type");
CREATE INDEX "StripeWebhookEvent_status_idx" ON "StripeWebhookEvent"("status");
CREATE INDEX "StripeWebhookEvent_receivedAt_idx" ON "StripeWebhookEvent"("receivedAt");

CREATE UNIQUE INDEX "StripeDispute_stripeDisputeId_key" ON "StripeDispute"("stripeDisputeId");
CREATE INDEX "StripeDispute_paymentId_idx" ON "StripeDispute"("paymentId");
CREATE INDEX "StripeDispute_orderId_idx" ON "StripeDispute"("orderId");
CREATE INDEX "StripeDispute_status_idx" ON "StripeDispute"("status");

CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
CREATE UNIQUE INDEX "Payment_providerChargeId_key" ON "Payment"("providerChargeId");
CREATE INDEX "Payment_providerChargeId_idx" ON "Payment"("providerChargeId");

CREATE UNIQUE INDEX "Refund_providerRefundId_key" ON "Refund"("providerRefundId");
CREATE INDEX "Refund_providerRefundId_idx" ON "Refund"("providerRefundId");

-- AddForeignKey
ALTER TABLE "OrderGroup" ADD CONSTRAINT "OrderGroup_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderGroupId_fkey" FOREIGN KEY ("orderGroupId") REFERENCES "OrderGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StripeConnectedAccount" ADD CONSTRAINT "StripeConnectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StripeDispute" ADD CONSTRAINT "StripeDispute_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StripeDispute" ADD CONSTRAINT "StripeDispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default platform config row
INSERT INTO "PlatformConfig" ("id", "platformFeePercent", "currency", "stripeConnectEnabled", "updatedAt", "createdAt")
VALUES ('singleton', 10, 'USD', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);