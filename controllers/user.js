const User = require('../models/user');
const upload = require("multer")().none();

exports.createUser = [
    upload,
    (req, res) => {
        const { phone_no, fb_uid } = req.body;

        if (!phone_no || !fb_uid) {
            return res.status(400).json({ message: "Phone number & firebase_UID is required" });
        }

        User.create(req.body, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error creating user", error: err });
            }
            res.status(201).json({ message: "User created successfully", uid: result.uid });
        });
    }
];

exports.getUser = (req, res) => {
    const uid = req.params.uid;
    User.fetch(uid, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

exports.checkUser = (req, res) => {
    const phone_no = req.params.phone_no;
    User.checkUser(phone_no, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length > 0) {
            const uid = results[0].uid; 
            return res.json({ exist: true, uid });
        } else {
            return res.json({ exist: false });
        }
    });
};

