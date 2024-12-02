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
  const deviceToken = event.params.deviceToken; // Get the document name as deviceToken

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
    // Subscribe the device token to the topic
    await getMessaging().subscribeToTopic([deviceToken], eventId);
    console.log(`Successfully subscribed device ${deviceToken} to topic ${eventId}.`);

    // Send a notification to the topic
    const response = await getMessaging().send({
      topic: eventId,
      notification: {
        title: title || "Default Title",
        body: msg || "Default Message",
      },
      data: {
        eventId,
        title: title || "Default Title",
        body: msg || "Default Message",
      },
    });

    console.log("Successfully sent message:", response);
  } catch (err) {
    console.error("Error subscribing to topic or sending message:", err);
  }
});
