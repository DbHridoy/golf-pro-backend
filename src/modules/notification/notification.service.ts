import type { Message } from "firebase-admin/messaging";

import type { CreateNotificationData } from "./notification.type";

import { notificationRepository } from "./notification.repository";

export class NotificationService {
  /**
   * Send a push notification and store in database
   */
  async createAndSendNotification(data: CreateNotificationData) {
    try {
      // 1. Store notification in database
      const notification = await notificationRepository.createNotification({
        recipientId: data.recipientId,
        relatedEntityId: data.relatedEntityId,
        type: data.type,
        title: data.title,
        message: data.body,
      });

      // 2. Get recipient's FCM token
      // Note: You'll need to implement a method to get user by ID with FCM token
      // const recipient = await getUserById(data.recipientId);
      // if (!recipient?.fcmToken) {
      //   console.log(`No FCM token for user ${data.recipientId}`);
      //   return notification;
      // }

      // 3. Send push notification
      // eslint-disable-next-line unused-imports/no-unused-vars
      const message: Message = {
        notification: {
          title: data.title,
          body: data.body,
        },
        data: {
          type: data.type,
          notificationId: notification._id.toString(),
          ...data.data,
        },
        // token: recipient.fcmToken, // Uncomment when you have FCM tokens
      };

      // await admin.messaging().send(message); // Uncomment when FCM tokens are available

      return notification;
    } catch (error) {
      console.error("Error creating/sending notification:", error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string) {
    return notificationRepository.getUserNotifications(userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return notificationRepository.markNotificationAsRead(
      notificationId,
      userId
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return notificationRepository.markAllNotificationsAsRead(userId);
  }
}

export const notificationService = new NotificationService();
