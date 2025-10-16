import type { BaseDocument } from "@/utils/base-schema.utils";

import type { NotificationType } from "./notification.type";

export interface INotification extends BaseDocument {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, any>;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date | null;
}
