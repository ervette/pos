import React, { useState, useEffect } from "react"
import LogoHeader from "../components/LogoHeader"
import "../styles/Dashboard.css"
import {
  fetchSalesData,
  fetchWorkloadData,
  fetchPopularItems,
  SalesData,
  WorkloadData,
  PopularItem,
} from "../services/dashboard.service"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const Dashboard: React.FC = () => {
  // State Management
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([])
  const [topItems, setTopItems] = useState<PopularItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const [sales, workload, popularItems] = await Promise.all([
          fetchSalesData(),
          fetchWorkloadData(),
          fetchPopularItems(),
        ])

        setSalesData(sales)
        setWorkloadData(workload)
        setTopItems(popularItems)
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("Failed to load data.")
      }
      setLoading(false)
    }

    loadDashboardData()
  }, [])

  if (loading) return <p className="loading">Loading...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <LogoHeader />
        <h1 className="dashboard-title">Dashboard</h1>
      </div>

      {/* Sales Cards */}
      <div className="sales-container">
        <div className="sales-card">
          <p className="sales-label">Today's Sales</p>
          <p className="sales-amount">
            £{salesData?.todaySales?.toFixed(2) ?? "0.00"}
          </p>
        </div>
        <div className="sales-card">
          <p className="sales-label">Weekly Sales</p>
          <p className="sales-amount">
            £{salesData?.weeklySales?.toFixed(2) ?? "0.00"}
          </p>
          <p
            className={`sales-change ${
              salesData?.weeklyChange && salesData.weeklyChange > 0
                ? "positive"
                : "negative"
            }`}
          >
            {salesData?.weeklyChange !== undefined
              ? salesData.weeklyChange > 0
                ? "↑"
                : "↓"
              : ""}
            {salesData?.weeklyChange !== undefined
              ? ` ${Math.abs(salesData.weeklyChange).toFixed(1)}%`
              : ""}
          </p>
        </div>
        <div className="sales-card">
          <p className="sales-label">Monthly Sales</p>
          <p className="sales-amount">
            £{salesData?.monthlySales?.toFixed(2) ?? "0.00"}
          </p>
          <p
            className={`sales-change ${
              salesData?.monthlyChange && salesData.monthlyChange > 0
                ? "positive"
                : "negative"
            }`}
          >
            {salesData?.monthlyChange !== undefined
              ? salesData.monthlyChange > 0
                ? "↑"
                : "↓"
              : ""}
            {salesData?.monthlyChange !== undefined
              ? ` ${Math.abs(salesData.monthlyChange).toFixed(1)}%`
              : ""}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-content">
        <div className="chart-container">
          <p className="chart-title">Workload</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workloadData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4ab3ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="top-items-container">
          <p className="top-items-title">Top Items</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={topItems}>
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#FFFFFF" }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#4ab3ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
