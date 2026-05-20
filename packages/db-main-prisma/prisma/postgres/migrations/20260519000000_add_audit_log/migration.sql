-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "record_count" INTEGER,
    "metadata" JSONB,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_action_created_time_idx" ON "audit_log"("action", "created_time");

-- CreateIndex
CREATE INDEX "audit_log_resource_type_created_time_idx" ON "audit_log"("resource_type", "created_time");

-- CreateIndex
CREATE INDEX "audit_log_resource_id_created_time_idx" ON "audit_log"("resource_id", "created_time");
