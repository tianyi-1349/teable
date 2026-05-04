-- CreateTable
CREATE TABLE "workflow_execution" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "base_id" TEXT NOT NULL,
    "trigger_type" TEXT,
    "status" TEXT NOT NULL,
    "event_payload" TEXT,
    "action_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_time" TIMESTAMP(3),
    "created_by" TEXT,

    CONSTRAINT "workflow_execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_execution_workflow_id_created_time_idx" ON "workflow_execution"("workflow_id", "created_time");

-- CreateIndex
CREATE INDEX "workflow_execution_base_id_workflow_id_idx" ON "workflow_execution"("base_id", "workflow_id");

-- CreateIndex
CREATE INDEX "workflow_execution_base_id_workflow_id_id_idx" ON "workflow_execution"("base_id", "workflow_id", "id");

-- AddForeignKey
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "base"("id") ON DELETE CASCADE ON UPDATE CASCADE;
