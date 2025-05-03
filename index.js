const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const port = process.env.PORT;
const app = express();

app.use(cors()); // Allow cross-origin requests if needed
app.use(express.json()); // For JSON data
const upload = multer();

// Routes
const orderRoutes = require("./routes/orders");
app.use(orderRoutes);
const userRoutes = require("./routes/users");
app.use(userRoutes);
const menuRoutes = require("./routes/menu");
app.use(menuRoutes);
const analyticsRoutes = require("./routes/analytics");
app.use(analyticsRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

