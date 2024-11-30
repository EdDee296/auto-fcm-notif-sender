import * as admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getMessaging } from "firebase-admin/messaging";

admin.initializeApp();

exports.myfunction = onDocumentWritten("notifications/{deviceToken}", async (event) => {
  // If `event.data.after` is null, the document was deleted
  if (!event.data || !event.data.after.exists) {
    console.log("Document deleted, skipping notification.");
    return;
  }

  const data = event.data.after.data();
  if (!data) {
    console.error("No data found in the document.");
    return;
  }

  const { title, msg, eventId } = data;

  if (!eventId) {
    console.error("No eventId found in the notification document.");
    return;
  }

  try {
    const response = await getMessaging().send({
      topic: eventId,
      notification: {
        title: title || "Default Title",
        body: msg || "Default Message",
      },
      data: {
        title: title || "Default Title",
        body: msg || "Default Message",
      },
    });
    console.log("Successfully sent message:", response);
  } catch (err) {
    console.error("Error sending message:", err);
  }
});
