const Menu = require("../models/menu");
const Helper = require("./helper");
const upload = require("../middleware/multer");

// ✅ Get Category
exports.getCategory = (req, res) => {
    const category_id = req.params.category_id;
    
    Menu.getCategory(category_id, (err, category) => {
        if (err) {
            console.error("Error fetching category:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        
        if (category.error) {
            return res.status(404).json({ error: category.error });
        }

        res.status(200).json(category);
    });
};

exports.addCategory = [
    upload.none(), 
    async (req, res) => {
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: "Category name is required!" });
        }

        try {
            const newCategoryId = await Helper.getNextCategoryId();
            Menu.createCategory(newCategoryId, category_name, (err) => {
                if (err) {
                    console.error("Error creating category:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.status(201).json({ message: "Category added successfully", id: newCategoryId });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];


// ✅ Update Category
exports.updateCategory = [
    upload.none(),
    async (req, res) => {
        const { category_id } = req.params;
        const { category_name } = req.body;

        if (!category_id || !category_name) 
            return res.status(400).json({ error: "Category ID and name are required!" });

        Menu.updateCategory(category_id, category_name, (err) => 
            err ? res.status(500).json({ error: "Internal Server Error" }) 
                : res.status(200).json({ message: "Category updated successfully" })
        );
    }
];


// ✅ Delete Category
exports.deleteCategory = (req, res) => {
    const { category_id } = req.params;
    
    Menu.deleteCategory(category_id, (err, result) => {
        if (err) {
            console.error("Error deleting category:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    });
};

// ✅ Get Item
exports.getItem = (req, res) => {
    const { item_id } = req.params;
    Menu.getItem(item_id || null, (err, items) => {
        if (err) {
            console.error("Error fetching items:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (!items || (Array.isArray(items) && items.length === 0)) {
            return res.status(404).json({ error: "No items found" });
        }
        res.status(200).json(items);
    });
};

exports.getItemByCategoryId = (req, res) => {
    const { category_id } = req.params;
    if (!category_id) {
        return res.status(400).json({ error: "category_id is required" });
    }

    Menu.getItemByCategoryId(category_id, (err, items) => {
        if (err) {
            console.error("Error fetching items:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found for the given category" });
        }
        res.status(200).json(items);
    });
};


// ✅ Add Item
exports.addItem = [
    upload.none(), 
    async (req, res) => {
        console.log(req.body)
        const { category_id, item_name, item_price, item_desc, available } = req.body;
        
        if (!category_id || !item_name || !item_price || !item_desc || available === undefined) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        try {
            const newItemId = await Helper.getNextItemId(category_id);
            Menu.createItem(newItemId, category_id, item_name, item_price, item_desc, available, (err) => {
                if (err) {
                    console.error("Error adding item:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.status(201).json({ message: "Item added successfully", id: newItemId });
            });
        } catch (error) {
            console.error("Error in addItem:", error);
            res.status(500).json({ error: error.message });
        }
    }
];

// ✅ Update Item
exports.updateItem = [
    upload.none(), 
    async (req, res) => {
        const { item_id } = req.params;
        const { item_name, item_price, available ,item_desc} = req.body;

        if (!item_id || !item_name || !item_price || !item_desc || available === undefined) {
            return res.status(400).json({ error: "All fields are required!" });
        }
        try {
            Menu.updateItem(item_id, item_name, item_price, available, item_desc, (err) => {
                if (err) {
                    console.error("Error updating item:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.status(200).json({ message: "Item updated successfully" });
            });
        } catch (error) {
            console.error("Error in updateItem:", error);
            res.status(500).json({ error: error.message });
        }
    }
];



// ✅ Delete Item
exports.deleteItem = (req, res) => {
    const { item_id } = req.params;

    Menu.deleteItem(item_id, (err, result) => {
        if (err) {
            console.error("Error deleting item:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.error) {
            return res.status(404).json({ error: result.error });
        }

        res.status(200).json({ message: "Item deleted successfully" });
    });
};
