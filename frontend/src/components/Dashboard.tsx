import React from "react"
import LogoHeader from "../components/LogoHeader" // Reusing our header
import "../styles/Dashboard.css"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const Dashboard: React.FC = () => {
  // Mock Data for Sales & Chart
  const salesData = [
    {
      label: "Today's Sales",
      amount: "£2351.33",
      change: "Up 17%",
      positive: true,
    },
    {
      label: "Weekly Sales",
      amount: "£22784.49",
      change: "Down 3%",
      positive: false,
    },
    {
      label: "Monthly Sales",
      amount: "£158009.20",
      change: "Down 2%",
      positive: false,
    },
  ]

  const workloadData = [
    { hour: "12", value: 1 },
    { hour: "13", value: 7 },
    { hour: "14", value: 10 },
    { hour: "15", value: 8 },
    { hour: "16", value: 15 },
    { hour: "17", value: 20 },
    { hour: "18", value: 20 },
    { hour: "19", value: 12 },
    { hour: "20", value: 16 },
    { hour: "21", value: 8 },
    { hour: "22", value: 5 },
    { hour: "23", value: 3 },
    { hour: "24", value: 0 },
  ]

  const topItemsData = [
    { name: "Corona", count: 25 },
    { name: "House Wine 250ml", count: 19 },
    { name: "Burger", count: 15 },
    { name: "Pizza", count: 15 },
    { name: "Chips", count: 13 },
  ]

  return (
    <div className="dashboard-container">
      {/* Header - Align Logo and Dashboard Title */}
      <div className="dashboard-header">
        <LogoHeader />
        <h1 className="dashboard-title">Dashboard</h1>
      </div>

      {/* Sales Cards */}
      <div className="sales-container">
        {salesData.map((sale, index) => (
          <div key={index} className="sales-card">
            <p className="sales-label">{sale.label}</p>
            <p className="sales-amount">{sale.amount}</p>
            <p
              className={`sales-change ${
                sale.positive ? "positive" : "negative"
              }`}
            >
              {sale.positive ? "↑" : "↓"} {sale.change}
            </p>
          </div>
        ))}
      </div>

      {/* Workload Chart & Top Items */}
      <div className="dashboard-content">
        {/* Workload Chart */}
        <div className="chart-container">
          <p className="chart-title">Workload</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workloadData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              {/* Removed vertical grid lines */}
              <Bar dataKey="value" fill="#4ab3ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Items Horizontal Bar Chart */}
        <div className="top-items-container">
          <p className="top-items-title">Top Items</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={topItemsData}>
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fill: "#FFFFFF" }}
              />
              <Tooltip />
              {/* Removed horizontal grid lines */}
              <Bar dataKey="count" fill="#4ab3ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
