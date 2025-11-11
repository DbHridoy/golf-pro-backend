import NotificationModel from "./notification.model";

export class NotificationRepository {
  /**
   * Create a new notification
   */
  async createNotification(data: {
    recipientId: string;
    type: string;
    title: string;
    body: string;
    payload?: Record<string, any>;
    data?: Record<string, any>;
  }) {
    return NotificationModel.create(data);
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    let query: any = { recipientId: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    return NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("recipientId", "fullName email");
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string) {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string) {
    return NotificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    return NotificationModel.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string) {
    return NotificationModel.countDocuments({
      recipientId: userId,
      isRead: false
    });
  }
}

export const notificationRepository = new NotificationRepository();