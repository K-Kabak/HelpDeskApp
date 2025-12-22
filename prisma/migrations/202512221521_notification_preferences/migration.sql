-- Notification preference table with opt-in defaults
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "NotificationPreference" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL UNIQUE,
    "emailTicketUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
    "emailCommentUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
    "inAppTicketUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
    "inAppCommentUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "NotificationPreference"
  ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION set_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_set_updated_at
BEFORE UPDATE ON "NotificationPreference"
FOR EACH ROW
EXECUTE PROCEDURE set_notification_preferences_updated_at();
