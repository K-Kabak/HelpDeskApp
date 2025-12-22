export type NotificationPreferenceSettings = {
  emailTicketUpdates: boolean;
  emailCommentUpdates: boolean;
  inAppTicketUpdates: boolean;
  inAppCommentUpdates: boolean;
};

export function defaultNotificationPreferences(): NotificationPreferenceSettings {
  return {
    emailTicketUpdates: true,
    emailCommentUpdates: true,
    inAppTicketUpdates: true,
    inAppCommentUpdates: true,
  };
}
