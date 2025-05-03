const multer = require("multer");

// Set up storage (optional, useful if you want to store files)
const storage = multer.memoryStorage(); // Keeps file in memory instead of saving to disk

const upload = multer({ storage: storage });

// Export the middleware
module.exports = upload;
