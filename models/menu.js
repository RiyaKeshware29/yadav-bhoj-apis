const db = require("../db");

const Menu = {
    // Get the last category ID
    getLastCategoryId: (callback) => {
        db.query(
            "SELECT category_id FROM list_category WHERE category_id <> 'X' ORDER BY category_id DESC LIMIT 1",
            (err, results) => callback(err, results?.[0]?.category_id || null)
        );
    },
    
    // Fetch category/categories
    getCategory: (category_id, callback = () => {}) => {
        const query = category_id 
            ? "SELECT * FROM list_category WHERE category_id = ?" 
            : "SELECT * FROM list_category";
        const params = category_id ? [category_id] : [];

        db.query(query, params, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.length ? (category_id ? results[0] : results) : { error: `Category ${category_id} not found` });
        });
    },

    // Create a new category
    createCategory: (category_id, categoryName, callback) => {
        db.query(
            "INSERT INTO list_category (category_id, category_name) VALUES (?, ?)", 
            [category_id, categoryName], 
            callback
        );
    },

    // Update an existing category
    updateCategory: (category_id, categoryName, callback) => {
        db.query(
            "UPDATE list_category SET category_name = ? WHERE category_id = ?", 
            [categoryName, category_id], 
            callback
        );
    },

    // Delete a category (except Uncategorized 'X')
    deleteCategory: (category_id, callback) => {
        if (category_id === "X") {
            return callback(null, { error: "Cannot delete the Uncategorized category." });
        }

        db.query("UPDATE list_category_item SET category_id = 'X' WHERE category_id = ?", [category_id], (err) => {
            if (err) return callback(err);

            db.query("DELETE FROM list_category WHERE category_id = ?", [category_id], (err) => {
                if (err) return callback(err);
                callback(null, { message: "Category deleted successfully. Items moved to 'Uncategorized'." });
            });
        });
    },

    // Get the last item ID in a category
    getLastItemId: (category_id, callback) => {
        db.query(
            "SELECT item_id FROM list_category_item WHERE category_id = ? ORDER BY item_id DESC LIMIT 1", 
            [category_id], 
            (err, results) => callback(err, results?.length ? parseInt(results[0].item_id.replace(category_id, ""), 10) : null)
        );
    },

    // Fetch item/items
    getItem: (item_id, callback = () => {}) => {
        const query = item_id 
            ? `
                SELECT 
                    i.item_id, 
                    i.item_name, 
                    i.item_price, 
                    i.available, 
                    i.item_desc, 
                    c.category_name,
                    c.category_id
                FROM list_category_item i
                JOIN list_category c ON i.category_id = c.category_id
                WHERE i.item_id = ?`
            : `
                SELECT 
                    i.item_id, 
                    i.item_name, 
                    i.item_price, 
                    i.available, 
                    i.item_desc, 
                    c.category_name,
                    c.category_id
                FROM list_category_item i
                JOIN list_category c ON i.category_id = c.category_id`;
    
        const params = item_id ? [item_id] : [];
    
        db.query(query, params, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results.length ? (item_id ? results[0] : results) : { error: `Item ${item_id} not found` });
        });
    },    

    getItemByCategoryId: (category_id, callback = () => {}) => {
        const query = "SELECT i.*,c.category_name FROM list_category_item i JOIN list_category c ON i.category_id = c.category_id WHERE i.category_id = ?";
        db.query(query, [category_id], (err, results) => {  
            if (err) return callback(err, null);
                if (results.length === 0) {
                    return callback(null, { error: `Item with category_id ${category_id} not found` });
                }
            callback(null, results);
        });
    },
    

    // Create a new item
    createItem: (item_id, category_id, item_name, item_price,item_desc, available, callback) => {
        db.query(
            "INSERT INTO list_category_item (item_id, category_id, item_name, item_price,item_desc, available) VALUES (?, ?, ?, ?, ?, ?)", 
            [item_id, category_id, item_name, item_price,item_desc, available], 
            callback
        );
    },

    // Update an existing item
    updateItem: (item_id, item_name, item_price, item_desc, available, callback) => {
        db.query(
            "UPDATE list_category_item SET item_price = ?, item_name = ?, available = ? ,item_desc =? WHERE item_id = ?", 
            [item_price, item_name,item_desc, available, item_id], 
            callback
        );
    },

    // Delete an item
    deleteItem: (item_id, callback) => {
        db.query("SELECT * FROM list_category_item WHERE item_id = ?", [item_id], (err, results) => {
            if (err) return callback(err);
            if (!results.length) return callback(null, { error: "Item not found." });

            db.query("DELETE FROM list_category_item WHERE item_id = ?", [item_id], (err) => {
                if (err) return callback(err);
                callback(null, { message: "Item deleted successfully." });
            });
        });
    }
};

module.exports = Menu;
