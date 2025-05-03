const admin = require("../firebase"); // Adjust the path if needed

// Hardcoded token for now (later get manager's token dynamically)
const registrationToken = 'e7jHpk9QxANqRtyweTfghU:APA91bFkXOhNZQMwXWAMe73WQnisoBwFqoqZ4HkMh33o7EEbV436WxEw72nYW7kmdqERGb9ozKNGnZ_5O702wN67DTJRblbxSbPxlt6exCu6aedTzUN_p9w';

async function sendOrderNotification(order_id, table_no) {
  const message = {
    data: {
      order_id: order_id.toString(),
      table_no: table_no.toString(),
      action: 'new_order',
      title: "New Order Placed 🍽️",
      body: `Order #${order_id} from Table ${table_no}`
    },
    token: registrationToken,

    android: { priority: "high" },
    apns: { payload: { aps: { contentAvailable: true } } },
    webpush: { headers: { Urgency: 'high' } }
  };

  try {
    const response = await admin.messaging().send(message);
    // console.log('Successfully sent order notification:', response);
  } catch (error) {
    console.error('Error sending order notification:', error.message);
    throw error;
  }
}

module.exports = { sendOrderNotification };
