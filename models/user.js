const db = require('../db');

const User = {
    checkUser: (phone_no, callback) => {
        let query = `SELECT * FROM customers WHERE phone_no = ?`;
        db.query(query, phone_no, callback);
    },   

    fetch: (uid, callback) => {
        let query = `SELECT * FROM customers`;
        const params = [];
    
        if (uid) {
            query += ` WHERE uid = ?`;
            params.push(uid);
        }
        db.query(query, params, callback);
    },
    
    create: (user, callback) => {
        const { phone_no, fb_uid } = user;
    
        db.query("SELECT value FROM id_value WHERE prefix = 'UID'", (err, result) => {
            if (err) return callback(err);
    
            let lastValue = result.length > 0 ? result[0].value : 0;
            let newValue = lastValue + 1;
            let newUid = `UID${newValue}`;
    
            const insertUserQuery = "INSERT INTO customers (uid, phone_no, fb_uid) VALUES (?, ?, ?)";
            db.query(insertUserQuery, [newUid, phone_no, fb_uid], (err, res) => {
                if (err) return callback(err);
    
                const updateValueQuery = "UPDATE id_value SET value = ? WHERE prefix = 'UID'";
                db.query(updateValueQuery, [newValue], (err, updateRes) => {
                    if (err) return callback(err);
                    callback(null, { uid: newUid, phone_no, fb_uid });
                });
            });
        });
    },
    
};

module.exports = User;
