import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getOpenOrders } from "../services/orders.service"
import { getConfigOffline } from "../services/config.service"
import LogoHeader from "./LogoHeader"
import "../styles/TablesPage.css"

const TablesPage = () => {
  const [tables, setTables] = useState<number[]>([])
  const [occupiedTables, setOccupiedTables] = useState<number[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTables = async () => {
      const config = await getConfigOffline()
      if (config) setTables(config.tables || [])
    }

    const fetchOccupiedTables = async () => {
      const orders = await getOpenOrders()
      if (orders) {
        const occupied = orders.map((order) => order.tableNumber)
        setOccupiedTables(occupied)
      }
    }

    fetchTables()
    fetchOccupiedTables()
  }, [])

  return (
    <div className="tables-page">
      {/* Header Section */}
      <div className="tables-header">
        <LogoHeader />
        <h1 className="tables-title">Tables</h1>
      </div>

      {/* Tables Grid */}
      <div className="tables-grid">
        {tables.map((tableNumber) => {
          const isOccupied = occupiedTables.includes(tableNumber)
          return (
            <div
              key={tableNumber}
              className={`table-card ${isOccupied ? "occupied" : "empty"}`}
              onClick={() => navigate(`/table/${tableNumber}`)}
            >
              <span className="table-text">T {tableNumber}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TablesPage
