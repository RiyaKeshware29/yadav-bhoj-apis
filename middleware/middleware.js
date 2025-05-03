const upload = require("./multer");

const validationRules = {
    "/item": ["category_id", "item_name", "item_price", "available"],
    "/category": ["category_name"],
};

exports.validateRequest = (req, res, next) => {
    upload.none()(req, res, (err) => {
        if (err) return res.status(400).json({ error: "File upload error" });

        // Validate request body
        const requiredFields = validationRules[req.path];
        if (requiredFields) {
            const missingFields = requiredFields.filter(field => !req.body[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
            }
        }
        next(); 
    });
};
