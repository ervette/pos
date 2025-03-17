import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import {
  getOrderByTable,
  removeOrderItem,
  cancelOrder,
} from "../services/orders.service"
import { handleOrderSubmission } from "../services/sync.service"
import {
  getMenuCategories,
  getMenuItemsByCategory,
} from "../services/menu.service"
import { Order, OrderItem } from "../localdb"
import LogoHeader from "../components/LogoHeader"
import { generatePrintableBillHTML } from "../services/bill.service"
import { getServerNameFromToken } from "../services/auth.service"
import "../styles/TableOrderPage.css"

interface MenuItem {
  itemId: string
  name: string
  variation?: string
  price: number
  category: string
  subcategory: string
  variations: { type: string; price: number }[]
  isAvailable: boolean
  modifiers?: string[]
}

interface MenuCategory {
  superCategory: string
  subCategories: string[]
}

const TableOrderPage = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>()
  const tableNum: number = Number(tableNumber)
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    null
  )
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [notes, setNotes] = useState<string>("")
  const [showModal, setShowModal] = useState<boolean>(false)

  const [showGratuityModal, setShowGratuityModal] = useState(false)
  const [gratuityType, setGratuityType] = useState<"percentage" | "amount">(
    "percentage"
  )
  const [gratuityValue, setGratuityValue] = useState<number>(0)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const existingOrder = await getOrderByTable(tableNum)
        if (existingOrder) {
          setOrder(existingOrder)
        }
      } catch (error) {
        console.error("Error fetching order by table:", error)
      }
    }

    const fetchCategories = async () => {
      try {
        const categories = await getMenuCategories()
        setMenuCategories(categories)

        
      } catch (error) {
        console.error("Error fetching menu categories:", error)
      }
    }

    fetchOrder()
    fetchCategories()
  }, [tableNum])

  const fetchItems = async (subCategory: string) => {
    try {
      const items = await getMenuItemsByCategory(subCategory)
      setMenuItems(items)
    } catch (error) {
      console.error("Error fetching menu items:", error)
    }
  }

  const handleCategoryClick = (superCategory: string) => {
    setSelectedCategory(
      selectedCategory === superCategory ? null : superCategory
    )
  }

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item)
    setSelectedVariation(
      item.variations.length > 0 ? item.variations[0].type : null
    )
    setSelectedModifiers([])
    setNotes("")
    setShowModal(true)
  }

  const handleAddItem = async () => {
    if (!selectedItem || !selectedVariation) {
      console.warn("Variation must be selected before adding an item.")
      return
    }

    const variation = selectedItem.variations.find(
      (v) => v.type === selectedVariation
    )
    if (!variation) {
      console.warn("Invalid variation selection.")
      return
    }

    let updatedOrder = order

    // ✅ Ensure orderId is always a string
    if (!updatedOrder) {
      console.log(
        `No existing order found for table ${tableNum}. Creating new order...`
      )

      const newOrder: Order = {
        orderId: crypto.randomUUID(), // ✅ Guarantees a string orderId
        tableNumber: tableNum,
        items: [],
        totalPrice: 0,
        orderStatus: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setOrder(newOrder)
      await handleOrderSubmission(newOrder)
      updatedOrder = newOrder
    }

    // ✅ Ensure updatedOrder is not null
    if (!updatedOrder) {
      console.error("Order could not be created.")
      return
    }

    // ✅ Add the item to the order
    const newItem: OrderItem = {
      orderItemId: crypto.randomUUID(),
      itemId: selectedItem.itemId,
      name: selectedItem.name,
      variation: selectedVariation,
      price: variation.price,
      quantity: 1,
      modifiers: selectedModifiers.length > 0 ? selectedModifiers : undefined,
      notes: notes.trim() ? notes : undefined,
    }

    updatedOrder = {
      ...updatedOrder,
      items: [...updatedOrder.items, newItem],
      totalPrice: updatedOrder.totalPrice + variation.price,
    }

    setOrder(updatedOrder)
    await handleOrderSubmission(updatedOrder)
    setShowModal(false)
  }

  const handleRemoveItem = async (orderItemId: string) => {
    if (!order) return

    console.log(
      `🛠 Attempting to remove orderItemId: ${orderItemId} from orderId: ${order.orderId}`
    )
    console.log(
      "🔍 Current order items:",
      order.items.map((item) => item.orderItemId)
    )

    // ✅ Check if the item exists before trying to remove it
    const itemExists = order.items.some(
      (item) => item.orderItemId === orderItemId
    )
    if (!itemExists) {
      console.warn(`❌ orderItemId ${orderItemId} not found in current order.`)
      return
    }

    // ✅ Remove item from local state
    const updatedItems = order.items.filter(
      (item) => item.orderItemId !== orderItemId
    )
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // ✅ Update UI immediately
    const updatedOrder = { ...order, items: updatedItems, totalPrice: newTotal }
    setOrder(updatedOrder)

    console.log(`🛠 Sending DELETE request for orderItemId: ${orderItemId}`)

    // ✅ Send request to backend
    await removeOrderItem(order.orderId, orderItemId)
  }

  const handleCancelOrder = async () => {
    if (!order) return

    try {
      await cancelOrder(order._id as string)
      setOrder({ ...order, orderStatus: "cancelled" })
      alert("Order cancelled successfully.")
      navigate("/tables")
    } catch (error) {
      console.error("Failed to cancel order:", error)
      alert("Failed to cancel order. Please try again.")
    }
  }

  const handleAddGratuity = async () => {
    if (!order) return

    if (!gratuityValue || gratuityValue <= 0) {
      alert("Please enter a valid gratuity value.")
      return
    }

    let gratuityAmount = gratuityValue

    // Convert % to £ based on current totalPrice
    if (gratuityType === "percentage") {
      gratuityAmount = (order.totalPrice * gratuityValue) / 100
    }

    const generateObjectId = (): string =>
      Array.from(crypto.getRandomValues(new Uint8Array(12)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    // Create a new gratuity item
    const gratuityItem: OrderItem = {
      orderItemId: crypto.randomUUID(),
      itemId: generateObjectId(),
      name: "Gratuity",
      variation: "flat", // ✅ Required by TS & backend
      price: parseFloat(gratuityAmount.toFixed(2)),
      quantity: 1,
      modifiers: [], // ✅ Add empty array if required
      notes: "Gratuity", // ✅ Optional but useful
    }

    // Add gratuity item to order
    const updatedItems = [...order.items, gratuityItem]
    const updatedTotal = order.totalPrice + gratuityItem.price

    const updatedOrder: Order = {
      ...order,
      items: updatedItems,
      totalPrice: updatedTotal,
      updatedAt: new Date(),
    }

    try {
      // Persist updated order to MongoDB
      await handleOrderSubmission(updatedOrder)
      setOrder(updatedOrder)
      setShowGratuityModal(false)
    } catch (error) {
      console.error("Error saving gratuity to DB:", error)
      alert("Failed to save gratuity. Please try again.")
    }
  }

  const handlePrintBill = () => {
    if (!order) return
    const serverName = getServerNameFromToken()
    const billHTML = generatePrintableBillHTML(order, serverName)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(billHTML)
      printWindow.document.close()
    } else {
      alert("Unable to open print window. Please check your popup blocker.")
    }
  }

  const handleSendOrder = () => {
    if (!order || order.items.length === 0) {
      console.warn("No items in order to send.");
      return;
    }
  
    if (menuCategories.length === 0) {
      console.warn("Menu categories not loaded.");
      return;
    }
  
    const drinksItems: OrderItem[] = [];
    const otherItems: OrderItem[] = [];
  
    order.items.forEach((orderItem) => {
      let foundSuperCategory: string | null = null;
  
      // ✅ Search through all menuCategories to find item's superCategory
      for (const category of menuCategories) {
        const match = menuItems.find(
          (menuItem) => menuItem.itemId === orderItem.itemId
        );
  
        if (match) {
          foundSuperCategory = category.superCategory;
          break;
        }
      }
  
      // ✅ Categorize based on superCategory
      if (foundSuperCategory?.toLowerCase() === "drinks") {
        drinksItems.push(orderItem);
      } else {
        otherItems.push(orderItem);
      }
    });
  
    // ✅ Formatter for pretty logs
    const formatItems = (items: OrderItem[]) => {
      return items
        .map((item) => {
          const base = `${item.name} ${item.variation ?? ""} | Qty: ${item.quantity} | £${item.price.toFixed(2)}`;
          const mods = item.modifiers?.length
            ? `  Modifiers: ${item.modifiers.join(", ")}`
            : "";
          const note = item.notes ? `  Note: ${item.notes}` : "";
          return `${base}${mods ? `\n${mods}` : ""}${note ? `\n${note}` : ""}`;
        })
        .join("\n---\n");
    };
  
    // ✅ Final logs
    console.log("🥤 Drinks Order:\n======================\n" + (drinksItems.length ? formatItems(drinksItems) : "None"));
    console.log("🍽️ Food Order:\n======================\n" + (otherItems.length ? formatItems(otherItems) : "None"));
  };
  

  return (
    <div className="table-order-container">
      <div className="table-order-header">
        <div className="logo-container">
          <LogoHeader />
        </div>
        <h1 className="table-order-title">Table {tableNum}</h1>
      </div>

      <div className="table-order-layout">
        {/* ✅ Bill Section (Left Panel) */}
        <div className="bill-section">
          <div className="bill-header">
            <button className="print-btn" onClick={handlePrintBill}>Print Bill</button>
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
              <div key={index} className="bill-row colored-item">
                <span>
                  {item.name} {item.variation}
                </span>
                <span>{item.quantity}</span>
                <span>£{item.price.toFixed(2)}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.orderItemId)}
                >
                  ❌
                </button>
                {item.modifiers?.length ? (
                  <ul className="modifiers-list">
                    {item.modifiers.map((mod, idx) => (
                      <li key={idx}>• {mod}</li>
                    ))}
                  </ul>
                ) : null}
                {item.notes && <p className="item-notes">• {item.notes}</p>}
              </div>
            ))}
          </div>
          <div className="bill-footer">
            <span>Total:</span>
            <span>£{order?.totalPrice.toFixed(2) || "0.00"}</span>
          </div>
          <div className="bill-actions">
            <button className="cancel-btn" onClick={handleCancelOrder}>
              Cancel
            </button>
            <button
              className="gratuity-btn"
              onClick={() => setShowGratuityModal(true)}
            >
              Gratuity
            </button>
            <button className="send-btn" onClick={handleSendOrder}>Send</button>
          </div>
        </div>

        {/* ✅ Middle Panel (Items) */}
        <div className="items-section">
          {menuItems.map((item) => (
            <button
              key={item.itemId}
              className="item-button"
              onClick={() => handleItemClick(item)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* ✅ Right Panel (Categories) */}
        <div className="menu-section">
          {menuCategories.map((category) => (
            <div key={category.superCategory} className="category-block">
              <button
                className="category-button"
                onClick={() => handleCategoryClick(category.superCategory)}
              >
                {category.superCategory}
              </button>
              {selectedCategory === category.superCategory && (
                <div className="subcategory-list">
                  {category.subCategories.map((sub) => (
                    <button
                      key={sub}
                      className="subcategory-button"
                      onClick={() => fetchItems(sub)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showGratuityModal && (
        <div className="modal-overlay">
          <div className="modal-content gratuity-modal">
            <button
              className="close-btn"
              onClick={() => setShowGratuityModal(false)}
            >
              ✖
            </button>
            <h2 className="modal-title">Add Gratuity</h2>

            <div className="gratuity-options">
              <label className="gratuity-radio">
                <input
                  type="radio"
                  name="gratuityType"
                  value="percentage"
                  checked={gratuityType === "percentage"}
                  onChange={() => setGratuityType("percentage")}
                />
                Percentage (%)
              </label>
              <label className="gratuity-radio">
                <input
                  type="radio"
                  name="gratuityType"
                  value="amount"
                  checked={gratuityType === "amount"}
                  onChange={() => setGratuityType("amount")}
                />
                Fixed (£)
              </label>
            </div>

            <input
              type="number"
              min="0"
              value={gratuityValue}
              onChange={(e) => setGratuityValue(parseFloat(e.target.value))}
              placeholder="Enter value"
              className="gratuity-input"
            />

            <button className="add-btn" onClick={handleAddGratuity}>
              Add Gratuity
            </button>
          </div>
        </div>
      )}

      {/* ✅ Pop-up for Selecting Variations, Modifiers & Notes */}
      {showModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* ✅ Close Button */}
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ✖
            </button>

            {/* ✅ Item Name */}
            <h2>{selectedItem.name}</h2>

            {/* ✅ Variations Selection */}
            <h4>Select Variation:</h4>
            <div className="modal-options">
              <h4>Select Variation:</h4>
              {selectedItem.variations.map((variation, idx) => (
                <label key={idx}>
                  <input
                    type="radio"
                    name="variation"
                    value={variation.type}
                    checked={selectedVariation === variation.type}
                    onChange={() => setSelectedVariation(variation.type)}
                  />
                  {variation.type} - £{variation.price.toFixed(2)}
                </label>
              ))}
            </div>

            {/* ✅ Modifiers Selection */}
            {selectedItem.modifiers && selectedItem.modifiers.length > 0 && (
              <>
                <h4>Add Modifiers:</h4>
                {selectedItem.modifiers.map((modifier, idx) => (
                  <label key={idx} className="modifier-label">
                    <input
                      type="checkbox"
                      value={modifier}
                      checked={selectedModifiers.includes(modifier)}
                      onChange={() =>
                        setSelectedModifiers((prev) =>
                          prev.includes(modifier)
                            ? prev.filter((m) => m !== modifier)
                            : [...prev, modifier]
                        )
                      }
                    />
                    {modifier}
                  </label>
                ))}
              </>
            )}

            {/* ✅ Notes Field */}
            <h4>Add Notes:</h4>
            <textarea
              className="notes-input"
              placeholder="Special instructions (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* ✅ Add Button */}
            <button className="add-btn" onClick={handleAddItem}>
              Add to Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableOrderPage
