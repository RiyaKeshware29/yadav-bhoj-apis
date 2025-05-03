const Menu = require("../models/menu");

const getNextCategoryId = async () => {
    try {
        const lastCategoryId = await new Promise((resolve, reject) => {
            Menu.getLastCategoryId((err, result) => {
                if (err) return reject(err);
                resolve(result);
                console.log(result);
            });
        });
        return lastCategoryId ? String.fromCharCode(lastCategoryId.charCodeAt(0) + 1) : "A";
    } catch (error) {
        console.error("Error generating next category ID:", error);
        throw new Error("Failed to generate category ID");
    }
};


const getNextItemId = async (categoryId) => {
    try {
        if (!categoryId) {
            throw new Error("Invalid categoryId: " + categoryId);
        }

        const lastItemNumber = await new Promise((resolve, reject) => {
            Menu.getLastItemId(categoryId, (err, result) => {
                if (err) return reject(err);
                resolve(result !== null ? parseInt(result, 10) : 0); // Ensure it's a number
            });
        });

        console.log("Last item number:", lastItemNumber);

        if (isNaN(lastItemNumber)) {
            throw new Error("Invalid last item number received: " + lastItemNumber);
        }

        return categoryId + String(lastItemNumber + 1); // Ensure proper string concatenation
    } catch (error) {
        console.error("Error generating next item ID:", error);
        throw new Error("Failed to generate item ID");
    }
};


module.exports = { getNextCategoryId, getNextItemId };
