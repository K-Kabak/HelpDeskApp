import { describe, expect, it } from "vitest";
import { defaultNotificationPreferences } from "./notification-preferences";

describe("notification preferences", () => {
  it("returns all toggles enabled by default", () => {
    const prefs = defaultNotificationPreferences();
    expect(prefs).toEqual({
      emailTicketUpdates: true,
      emailCommentUpdates: true,
      inAppTicketUpdates: true,
      inAppCommentUpdates: true,
    });
  });
});
