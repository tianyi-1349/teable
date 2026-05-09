-- CreateTable
CREATE TABLE "chat_session" (
    "id" TEXT NOT NULL,
    "base_id" TEXT NOT NULL,
    "title" TEXT,
    "model_key" TEXT,
    "context_nodes" TEXT,
    "view_id" TEXT,
    "table_id" TEXT,
    "selected_record_ids" TEXT,
    "credit_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "token_used" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_time" TIMESTAMP(3),
    "deleted_time" TIMESTAMP(3),

    CONSTRAINT "chat_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT,
    "tool_calls" TEXT,
    "tool_call_results" TEXT,
    "credit_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "token_used" INTEGER NOT NULL DEFAULT 0,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_session_base_id_created_by_created_time_idx" ON "chat_session"("base_id", "created_by", "created_time");

-- CreateIndex
CREATE INDEX "chat_session_created_by_last_modified_time_idx" ON "chat_session"("created_by", "last_modified_time");

-- CreateIndex
CREATE INDEX "chat_message_session_id_created_time_idx" ON "chat_message"("session_id", "created_time");

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
