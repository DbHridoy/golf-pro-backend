// src/services/notification.service.ts
import { fcm } from "../config/firebase.config";

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  deviceToken: string,
  payload: PushNotificationPayload,
) {
  try {
    const message = {
      token: deviceToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await fcm.send(message);
    console.log("✅ Push notification sent:", response);
    return { success: true, messageId: response };
  }
  catch (error: any) {
    console.error("❌ Error sending notification:", error.message);
    return { success: false, error: error.message };
  }
}

// how to call
// import { sendPushNotification } from "../services/notification.service";

// export const notifyUser = async (req, res) => {
//   const { deviceToken, title, body } = req.body;

//   const result = await sendPushNotification(deviceToken, {
//     title,
//     body,
//     data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
//   });

//   res.json(result);
// };
