import React, { useEffect, useState } from "react"
import LogoHeader from "./LogoHeader"
import OrderRow from "./OrderRow"
import { Order } from "../localdb"
import { fetchOrders } from "../services/archive.service"
import "../styles/ArchivePage.css"

const ArchivePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [limit, setLimit] = useState<number>(5)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders(limit)
        // Sort newest to oldest
        const sorted = fetchedOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sorted)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      }
    }

    loadOrders()
  }, [limit]) // Re-fetch when limit changes

  return (
    <div className="archive-container">
      <div className="archive-header">
        <LogoHeader />
        <h1 className="archive-title">Archive</h1>
      </div>

      <div className="entry-selector">
        <label>Show entries:</label>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          {[5, 10, 15, 20, 50, 100].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="archive-table">
        <div className="table-header">
          <span>Table No</span>
          <span>Date/Time</span>
          <span>Status</span>
          <span></span>
        </div>
        {orders.map((order) => (
          <OrderRow key={order.orderId} order={order} />
        ))}
      </div>
    </div>
  )
}

export default ArchivePage
