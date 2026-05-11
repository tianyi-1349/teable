-- CreateTable
CREATE TABLE "workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_id" TEXT NOT NULL,
    "order" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "active_snapshot_id" TEXT,
    "deleted_time" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),
    "last_modified_by" TEXT,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_node" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "parent_node_id" TEXT,
    "next_node_id" TEXT,
    "branch_key" TEXT,
    "config" JSONB,
    "test_status" TEXT,
    "test_output" JSONB,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),
    "last_modified_by" TEXT,

    CONSTRAINT "workflow_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_snapshot" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_run" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "snapshot_id" TEXT,
    "trigger_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" JSONB,
    "started_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_time" TIMESTAMP(3),
    "duration_ms" INTEGER,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "workflow_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_run_step" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" JSONB,
    "started_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_time" TIMESTAMP(3),
    "duration_ms" INTEGER,

    CONSTRAINT "workflow_run_step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_base_id_deleted_time_idx" ON "workflow"("base_id", "deleted_time");

-- CreateIndex
CREATE INDEX "workflow_base_id_order_idx" ON "workflow"("base_id", "order");

-- CreateIndex
CREATE INDEX "workflow_node_workflow_id_idx" ON "workflow_node"("workflow_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_snapshot_workflow_id_version_key" ON "workflow_snapshot"("workflow_id", "version");

-- CreateIndex
CREATE INDEX "workflow_snapshot_workflow_id_idx" ON "workflow_snapshot"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_run_workflow_id_started_time_idx" ON "workflow_run"("workflow_id", "started_time");

-- CreateIndex
CREATE INDEX "workflow_run_status_idx" ON "workflow_run"("status");

-- CreateIndex
CREATE INDEX "workflow_run_step_run_id_idx" ON "workflow_run_step"("run_id");

-- CreateIndex
CREATE INDEX "workflow_run_step_node_id_idx" ON "workflow_run_step"("node_id");

-- AddForeignKey
ALTER TABLE "workflow_node" ADD CONSTRAINT "workflow_node_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_snapshot" ADD CONSTRAINT "workflow_snapshot_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_run" ADD CONSTRAINT "workflow_run_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_run" ADD CONSTRAINT "workflow_run_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "workflow_snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_run_step" ADD CONSTRAINT "workflow_run_step_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "workflow_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
