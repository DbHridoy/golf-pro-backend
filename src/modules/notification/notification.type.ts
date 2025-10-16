export type NotificationType =
  | 'friend_request_sent'
  | 'friend_request_accepted'
  | 'event_created'
  | 'post_created';

export const NOTIFICATION_TYPES = [
  'friend_request_sent',
  'friend_request_accepted', 
  'event_created',
  'post_created'
] as const;
export interface NotificationPayload {
  friendRequestId?: string;
  eventId?: string;
  postId?: string;
  senderName?: string;
  eventName?: string;
  postTitle?: string;
}

export interface CreateNotificationData {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload?: NotificationPayload;
  data?: Record<string, any>;
}