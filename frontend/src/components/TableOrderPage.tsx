import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getOrderByTable } from "../services/orders.service"
import { handleOrderSubmission } from "../services/sync.service"
import {
  getMenuCategories,
  getMenuItemsByCategory,
} from "../services/menu.service"
import { Order } from "../localdb"
import LogoHeader from "../components/LogoHeader"
import "../styles/TableOrderPage.css"

// ✅ Define Types
interface MenuItem {
  itemId: string
  name: string
  variation?: string
  price: number
  category: string
  subcategory: string
}

interface MenuCategory {
  superCategory: string
  subCategories: string[]
}

const TableOrderPage = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>()
  const tableNum: number = Number(tableNumber)

  const [order, setOrder] = useState<Order | null>(null)
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [offline, setOffline] = useState<boolean>(!navigator.onLine)

  useEffect(() => {
    const fetchOrder = async () => {
      const existingOrder = await getOrderByTable(tableNum)

      if (existingOrder) {
        const fixedOrder: Order = {
          ...existingOrder,
          items: existingOrder.items.map((item) => ({
            itemId: "itemId" in item ? item.itemId : crypto.randomUUID(), // ✅ Ensure itemId exists
            name: item.name ?? "Unknown Item",
            variation: "variation" in item ? item.variation : "Default", // ✅ Ensure variation exists
            price: item.price ?? 0,
            quantity: item.quantity ?? 1,
          })),
        }

        setOrder(fixedOrder)
      }
    }

    const fetchCategories = async () => {
      const categories: MenuCategory[] = await getMenuCategories()
      setMenuCategories(categories)
    }

    fetchOrder()
    fetchCategories()

    const handleOnlineStatus = () => setOffline(!navigator.onLine)
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [tableNum])

  const handleCategoryClick = async (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
      setMenuItems([])
      return
    }
    setSelectedCategory(category)
    const items: MenuItem[] = await getMenuItemsByCategory(category)
    setMenuItems(items)
  }

  const handleAddItem = (item: MenuItem) => {
    const newItem = {
      itemId: item.itemId ?? crypto.randomUUID(), // ✅ Ensure itemId exists
      name: item.name,
      variation: item.variation ?? "Default",
      price: item.price,
      quantity: 1,
    }

    const updatedOrder: Order = {
      ...order!,
      tableNumber: tableNum,
      items: [...(order?.items || []), newItem], // ✅ Ensure all items follow the same structure
      totalPrice: (order?.totalPrice || 0) + item.price,
      status: "open",
      createdAt: order?.createdAt || new Date(),
    }

    setOrder(updatedOrder)
    handleOrderSubmission(updatedOrder)
  }

  return (
    <div className="table-order-container">
      {offline && (
        <div className="offline-banner">
          ⚠️ Offline Mode: Data will sync when online.
        </div>
      )}

      <div className="table-order-header">
        <LogoHeader />
        <h1 className="table-order-title">Table {tableNum}</h1>
      </div>

      <div className="table-order-layout">
        {/* ✅ Left Panel - Bill Preview */}
        <div className="bill-section">
          <div className="bill-header">
            <button className="print-btn">Print Bill</button>
            <span className="table-label">T{tableNum}</span>
            <button className="pay-btn">Pay</button>
          </div>
          <div className="bill-table">
            <div className="bill-row header">
              <span>Name</span>
              <span>Qty</span>
              <span>Price</span>
            </div>
            {order?.items?.map((item, index) => (
              <div key={index} className="bill-row">
                <span>{item.name}</span>
                <span>{item.quantity}</span>
                <span>£{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="bill-footer">
            <span>Total:</span>
            <span>£{order?.totalPrice?.toFixed(2) || "0.00"}</span>
          </div>
        </div>

        {/* ✅ Middle Panel - Item Grid */}
        <div className="items-section">
          {menuItems.length === 0 ? (
            <p className="select-category-text">
              Select a category to view items
            </p>
          ) : (
            menuItems.map((item) => (
              <button
                key={item.itemId}
                className="item-button"
                onClick={() => handleAddItem(item)}
              >
                {item.name}
              </button>
            ))
          )}
        </div>

        {/* ✅ Right Panel - Menu Categories */}
        <div className="menu-section">
          {menuCategories.map((category) => (
            <div key={category.superCategory}>
              <button
                className={`category-button ${
                  selectedCategory === category.superCategory ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category.superCategory)}
              >
                {category.superCategory}
              </button>
              {selectedCategory === category.superCategory &&
                category.subCategories.map((sub) => (
                  <button
                    key={sub}
                    className="subcategory-button"
                    onClick={() => handleCategoryClick(sub)}
                  >
                    {sub}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TableOrderPage
