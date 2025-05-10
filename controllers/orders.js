const Order = require('../models/orders');
const upload = require("multer")().none();

exports.getOrder = (req, res) => {
    const uid = req.params.uid;
    Order.fetch(uid, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

exports.getOrderByOrderId = (req, res) => {
    const order_id = req.params.order_id;
    Order.getOrderByOrderId(order_id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// For getting full table order details (existing behavior)
exports.getOrderByTable = (req, res) => {
    const table = req.params.table;

    Order.getOrderByTable(table, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// New: For checking which tables are available or busy
exports.checkAvailableTables = (req, res) => {
    Order.getOrderByTable('', (err, results) => { // empty '' to fetch all tables
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const tables = results.map(row => ({
            table_no: row.table_no,
            available: row.table_activity === 'empty'
        }));

        res.json(tables);
    });
};


// exports.createOrder = [
//     upload,
//     (req, res) => {
//         try {
//             const { uid, table_no, total_price, payment_status, items } = req.body;
//             let parsedItems;
//             if (typeof items === "string") {
//                 try {
//                     parsedItems = JSON.parse(items);
//                 } catch (jsonError) {
//                     console.error("JSON Parsing Error:", jsonError.message);
//                     return res.status(400).json({ message: "Invalid JSON format in items", error: jsonError.message });
//                 }
//             } else {
//                 parsedItems = items;
//             }
//             if (!uid || !table_no || !total_price || !Array.isArray(parsedItems) || parsedItems.length === 0) {
//                 return res.status(400).json({ message: "uid, table_no, total_price, and valid items are required" });
//             }
//             Order.createOrderMaster({ uid, table_no, total_price, payment_status }, (err, order_id) => {
//                 if (err) return res.status(500).json({ message: "Error inserting order_master", error: err });

//                 Order.createOrderDetails(order_id, parsedItems, (err) =>
//                     err ? res.status(500).json({ message: "Error inserting order_details", error: err })
//                         : res.status(201).json({ message: "Order placed successfully", order_id })
//                 );
//             });

//         } catch (error) {
//             console.error("Unexpected Error:", error.message);
//             return res.status(400).json({ message: "Unexpected error", error: error.message });
//         }
//     }
// ];


const { sendOrderNotification } = require("../notifications/send-notification");

exports.createOrder = [
  upload,
  async (req, res) => {
    try {
      const { uid, table_no, total_price, payment_status, items } = req.body;
      let parsedItems;
      if (typeof items === "string") {
        try {
          parsedItems = JSON.parse(items);
        } catch (jsonError) {
          console.error("JSON Parsing Error:", jsonError.message);
          return res.status(400).json({ message: "Invalid JSON format in items", error: jsonError.message });
        }
      } else {
        parsedItems = items;
      }

      if (!uid || !table_no || !total_price || !Array.isArray(parsedItems) || parsedItems.length === 0) {
        return res.status(400).json({ message: "uid, table_no, total_price, and valid items are required" });
      }

      Order.createOrderMaster({ uid, table_no, total_price, payment_status }, (err, order_id) => {
        if (err) return res.status(500).json({ message: "Error inserting order_master", error: err });

        Order.createOrderDetails(order_id, parsedItems, async (err) => {
          if (err) return res.status(500).json({ message: "Error inserting order_details", error: err });

          // 🛎️ Send notification after successful order creation
          try {
            await sendOrderNotification(order_id, table_no);
          } catch (notifError) {
            console.error("Error sending notification:", notifError.message);
          }

          res.status(201).json({ message: "Order placed successfully", order_id });
        });
      });

    } catch (error) {
      console.error("Unexpected Error:", error.message);
      return res.status(400).json({ message: "Unexpected error", error: error.message });
    }
  }
];


// For manager accept/reject
exports.updateOrderStatus = [
    upload,
    (req, res) => {
      const { order_id } = req.body;
      const { flag } = req.query;
  
      if (!order_id || !flag) return res.status(400).json({ message: "order_id and flag are required" });
  
      const masterStatus = flag === "accepted" ? "accepted" : "rejected";
  
      Order.updateOrderMasterStatus(order_id, masterStatus, (err) => {
        if (err) return res.status(500).json({ message: "Error updating order_master", error: err });
  
        Order.updateOrderDetailsStatus(order_id, masterStatus, null, (err) =>
          err ? res.status(500).json({ message: "Error updating order_details", error: err })
            : res.status(200).json({ message: `Order ${flag} successfully`, order_id })
        );
      });
    }
  ];
  
  // For item status update only
  exports.updateItemStatus = [
    upload,
    (req, res) => {
      const { order_id, item_id, item_status } = req.body;
  
      if (!order_id || !item_id || !item_status) {
        return res.status(400).json({ message: "order_id, item_id, and item_status are required" });
      }
  
      Order.updateOrderDetailsStatus(order_id, item_status, item_id, (err) =>
        err ? res.status(500).json({ message: "Error updating item status", error: err })
          : res.status(200).json({ message: "Item status updated successfully" })
      );
    }
  ];
  

exports.updatePaymentByOrderId = [
  upload, 
  async (req, res) => {
    const { order_id } = req.params;
    const { payment_status } = req.body;
    if (!payment_status) {
      return res.status(400).json({ message: "Missing payment_status in body" });
    }
    try {
      await Order.updatePaymentStatusById(order_id, payment_status);
      res.status(200).json({ message: `Payment status updated for order ${order_id}` });
    } catch (error) {
      console.error('Payment update error:', error);
      res.status(500).json({ message: 'Failed to update payment status' });
    }
  }
];





