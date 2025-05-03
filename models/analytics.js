const db = require('../db');

const Analytics = {
  fetchTodayStats: (callback) => {
    const totalSql = `
      SELECT COUNT(*) AS totalOrders
      FROM order_master
      WHERE DATE(date_time) = CURDATE()
    `;

    const topItemSql = `
      SELECT 
        i.item_name,
        SUM(od.quantity) AS totalQuantity
      FROM order_details od
      JOIN order_master om ON od.order_id = om.order_id
      JOIN list_category_item i ON od.item_id = i.item_id
      WHERE DATE(om.date_time) = CURDATE()
      GROUP BY i.item_name
      ORDER BY totalQuantity DESC
      LIMIT 1
    `;

    const totalUsersSql = `
      SELECT COUNT(*) AS totalUsers FROM customers
    `;

    const totalRevenueSql = `
   SELECT 
  SUM(od.quantity * i.item_price) AS totalRevenue
FROM order_details od
JOIN order_master om ON od.order_id = om.order_id
JOIN list_category_item i ON od.item_id = i.item_id
WHERE DATE(om.date_time) = CURDATE()
`;

    db.query(totalSql, (err, totalResults) => {
      if (err) return callback(err);
      const totalOrders = totalResults[0].totalOrders;

      db.query(topItemSql, (err, topResults) => {
        if (err) return callback(err);
        const mostOrderedItem = topResults.length ? topResults[0].item_name : null;

        db.query(totalUsersSql, (err, userResults) => {
          if (err) return callback(err);
          const totalUsers = userResults[0].totalUsers;

          db.query(totalRevenueSql, (err, revenueResults) => {
            if (err) return callback(err);
            const totalRevenue = revenueResults[0].totalRevenue || 0;
            const aov = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

            callback(null, {
              totalOrders,
              mostOrderedItem,
              totalUsers,
              totalRevenue,
              aov
            });
          });
        });
      });
    });
  }
};

module.exports = Analytics;
