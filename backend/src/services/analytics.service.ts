import Order from "../models/order.model";
import Menu from "../models/menu.model";

/**
 * Get total sales grouped by superCategory.
 */
export const getTotalSalesByCategory = async (): Promise<any> => {
  return await Order.aggregate([
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
};

/**
 * Get daily sales report.
 */
export const getDailySales = async (date: Date): Promise<any> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  return await Order.aggregate([
    { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$items.totalItemPrice" },
      },
    },
    { $project: { _id: 0, totalSales: 1 } },
  ]);
};

/**
 * Get low-stock items.
 */
export const getLowStockItems = async (threshold: number): Promise<any> => {
  return await Menu.aggregate([
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
    { $sort: { quantity: 1 } },
  ]);
};

/**
 * Get most popular items by order count.
 */
export const getPopularItems = async (): Promise<any> => {
  return await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { orderCount: -1 } },
    { $limit: 10 }, // Top 10 popular items
  ]);
};
