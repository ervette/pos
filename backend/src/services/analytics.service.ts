import Menu from "../models/menu.model";
import Order from "../models/order.model";

/**
 * Get total sales grouped by superCategory.
 */
export const getTotalSalesByCategory = async () => {
  const sales = await Order.aggregate([
    { $unwind: "$items" }, // Flatten items array
    {
      $lookup: {
        from: "menus",
        localField: "items.itemId",
        foreignField: "_id",
        as: "menuItem",
      },
    },
    { $unwind: "$menuItem" }, // Flatten menuItem array
    {
      $group: {
        _id: "$menuItem.superCategory",
        totalSales: { $sum: "$items.totalItemPrice" },
      },
    },
    { $sort: { totalSales: -1 } },
  ]);

  return sales;
};

/**
 * Get items with stock below a threshold.
 */
export const getLowStockItems = async (threshold: number) => {
  const lowStockItems = await Menu.aggregate([
    { $unwind: "$items" },
    { $unwind: "$items.variations" },
    { $match: { "items.variations.quantity": { $lt: threshold } } },
    {
      $project: {
        name: "$items.name",
        variation: "$items.variations.type",
        quantity: "$items.variations.quantity",
      },
    },
    { $sort: { quantity: 1 } }, // Sort by lowest stock first
  ]);

  return lowStockItems;
};

/**
 * Get daily sales report.
 */
export const getDailySales = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of the day

  const sales = await Order.aggregate([
    { $match: { createdAt: { $gte: today } } }, // Filter orders created today
    { $unwind: "$items" },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$items.totalItemPrice" },
      },
    },
    { $project: { _id: 0, totalSales: 1 } }, // Remove _id field from output
  ]);

  return sales[0]?.totalSales || 0;
};
