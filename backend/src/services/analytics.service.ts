import Order from "../models/order.model"

interface SalesReport {
  todaySales: number
  weeklySales: number
  monthlySales: number
  weeklyChange: number
  monthlyChange: number
}

interface WorkloadData {
  hour: number
  count: number
}

interface PopularItem {
  name: string
  count: number
}

const PAID_STATUSES = ["paid_cash", "paid_card", "paid_other"] // ✅ Unified paid statuses

/**
 * Get sales report including daily, weekly, and monthly sales.
 */
export const getSalesReport = async (): Promise<SalesReport> => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)

  const startOfMonth = new Date(today)
  startOfMonth.setDate(1) // First of the month

  const getTotalSales = async (
    startDate: Date,
    endDate: Date
  ): Promise<number> => {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: PAID_STATUSES }, // ✅ Match any paid_* status
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $project: { _id: 0, totalSales: 1 } },
    ])
    return result.length > 0 ? result[0].totalSales : 0
  }

  const [todaySales, weeklySales, monthlySales] = await Promise.all([
    getTotalSales(today, new Date()),
    getTotalSales(startOfWeek, new Date()),
    getTotalSales(startOfMonth, new Date()),
  ])

  const previousWeekStart = new Date(startOfWeek)
  previousWeekStart.setDate(previousWeekStart.getDate() - 7)

  const previousMonthStart = new Date(startOfMonth)
  previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)

  const previousWeekSales = await getTotalSales(previousWeekStart, startOfWeek)
  const previousMonthSales = await getTotalSales(
    previousMonthStart,
    startOfMonth
  )

  return {
    todaySales,
    weeklySales,
    monthlySales,
    weeklyChange: previousWeekSales
      ? ((weeklySales - previousWeekSales) / previousWeekSales) * 100
      : 0,
    monthlyChange: previousMonthSales
      ? ((monthlySales - previousMonthSales) / previousMonthSales) * 100
      : 0,
  }
}

/**
 * Get sales grouped by hour for workload visualization.
 */
export const getHourlyWorkload = async (): Promise<WorkloadData[]> => {
  return await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: PAID_STATUSES }, // ✅ Only include paid orders
      },
    },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        hour: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ])
}

/**
 * Get most popular items by order count.
 */
export const getPopularItems = async (): Promise<PopularItem[]> => {
  return await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: PAID_STATUSES }, // ✅ Only include paid orders
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        name: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ])
}
