import { messaging } from "@/config/firebase.config";
import { logger } from "@/middlewares/pino-logger";

/**
 * Send FCM notification to multiple devices
 */
export async function sendFCMNotification(
  fcmTokens: string[],
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  },
) {
  try {
    const multicastMessage = {
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };
    const response = await messaging.sendEachForMulticast(multicastMessage);

    logger.warn(`✅ FCM sent: ${response.successCount} success, ${response.failureCount} failures`);

    return response;
  }
  catch (error) {
    console.error("Error sending FCM notification:", error);
    throw error;
  }
}

/**
 * Send to single device
 */
export async function sendFCMToDevice(
  fcmToken: string,
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  },
) {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      token: fcmToken,
    };

    const response = await messaging.send(message);
    console.log("✅ FCM sent successfully:", response);
    return response;
  }
  catch (error) {
    console.error("Error sending FCM to device:", error);
    throw error;
  }
}
