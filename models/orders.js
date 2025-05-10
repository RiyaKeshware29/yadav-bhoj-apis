const db = require('../db');

const Order = {
    fetch: (uid, callback) => {
        let query = `
            SELECT 
                om.order_id,
                om.table_no, 
                od.item_id, 
                om.total_price, 
                om.status, 
                om.payment_status, 
                om.date_time, 
                od.order_status, 
                od.quantity,
                li.item_name,
                li.item_price
            FROM order_master om
            LEFT JOIN order_details od ON om.order_id = od.order_id
            LEFT JOIN list_category_item li ON od.item_id = li.item_id
        `;
        
        const params = [];
    
        if (uid) {
            query += ` WHERE om.uid = ?`;
            params.push(uid);
        }
    
        db.query(query, params, callback);
    },   
    
    getOrderByOrderId: (order_id, callback) => {
        let query = `
            SELECT 
                om.order_id,
                om.table_no, 
                om.status, 
                od.item_id, 
                om.total_price, 
                om.payment_status, 
                DATE_FORMAT(om.date_time, '%Y-%m-%d %h:%i %p') AS date_time,
                od.order_status, 
                od.quantity,
                li.item_name,
                li.item_price
            FROM order_master om
            LEFT JOIN order_details od ON om.order_id = od.order_id
            LEFT JOIN list_category_item li ON od.item_id = li.item_id
            WHERE om.order_id = ?
        `;
    
        db.query(query, [order_id], callback); 
    }, 

    getOrderByTable: (table, callback) => {
        let query = `
            SELECT 
                om.table_no,
                om.order_id AS last_order_id,
                om.total_price,
                om.payment_status,
                DATE_FORMAT(om.date_time, '%Y-%m-%d %h:%i %p') AS date_time,
                om.status,
            CASE 
                WHEN SUM(CASE WHEN om.status = 'done' OR om.status = 'rejected' THEN 1 ELSE 0 END) = COUNT(*) 
                THEN 'empty'
                ELSE 'active'
            END AS table_activity,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'item_id', li.item_id,
                        'name', li.item_name,
                        'order_status', od.order_status,
                        'quantity', od.quantity
                    )
                ) AS ordered_items
            FROM order_master om
            JOIN (
                SELECT table_no, MAX(date_time) AS latest_time
                FROM order_master
                WHERE DATE(date_time) = CURDATE()
                GROUP BY table_no
            ) latest ON om.table_no = latest.table_no AND om.date_time = latest.latest_time
            JOIN order_details od ON om.order_id = od.order_id
            JOIN list_category_item li ON od.item_id = li.item_id
        `;
    
        const params = [];
    
        if (table && table !== '') {
            query += ` WHERE om.table_no = ?`;
            params.push(table);
        }
    
        query += ` GROUP BY om.order_id`;
        query += ` ORDER BY om.date_time DESC`;
    
        db.query(query, params, callback);
    },    
            

    createOrderMaster: ({ uid, table_no, total_price, payment_status }, callback) => {
        db.query("SELECT value FROM id_value WHERE prefix = 'ORD'", (err, result) => {
            if (err) return callback(err);
            const currentDateTime = new Date(); 

            let lastValue = result.length > 0 ? result[0].value : 0;
            let newValue = lastValue + 1;
            let order_id = `ORD${newValue}`;

            const insertOrderQuery = `
                INSERT INTO order_master (order_id, uid, table_no, total_price, payment_status, date_time, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.query(insertOrderQuery, [order_id, uid, table_no, total_price, payment_status || 'unpaid',currentDateTime,'pending'], (err, res) => {
                if (err) return callback(err);

                db.query("UPDATE id_value SET value = ? WHERE prefix = 'ORD'", [newValue], (err) => {
                    if (err) return callback(err);
                    callback(null, order_id);
                });
            });
        });
    },

    createOrderDetails: (order_id, items, callback) => {
        const values = items.map(({ item_id, quantity }) => [order_id, item_id, quantity]);
        const insertOrderDetailsQuery = `
            INSERT INTO order_details (order_id, item_id, quantity)
            VALUES ?`;

        db.query(insertOrderDetailsQuery, [values], callback);
    },


    updateOrderMasterStatus: (order_id, status, callback) => {
        const query = "UPDATE order_master SET status = ? WHERE order_id = ?";
        db.query(query, [status, order_id], callback);
    },

    updateOrderDetailsStatus: (order_id, status,item_id, callback) => {
        let query = item_id 
        ? "UPDATE order_details SET order_status = ? WHERE order_id = ? AND item_id = ?" 
        : "UPDATE order_details SET order_status = ? WHERE order_id = ?";
        db.query(query, item_id ? [status, order_id, item_id] : [status, order_id], callback);    
    },

    updatePaymentStatusById: (order_id, payment_status) => {
        let sql;
        let params;
    
        if (payment_status === 'paid') {
            sql = `UPDATE order_master SET payment_status = ?, status = 'done' WHERE order_id = ?`;
            params = [payment_status, order_id];
        } else {
            sql = `UPDATE order_master SET payment_status = ? WHERE order_id = ?`;
            params = [payment_status, order_id];
        }
    
        db.query(sql, params);
    }    
};

module.exports = Order;
