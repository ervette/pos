import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getOrderByTable, removeOrderItem } from "../services/orders.service"
import { handleOrderSubmission } from "../services/sync.service"
import {
  getMenuCategories,
  getMenuItemsByCategory,
} from "../services/menu.service"
import { Order } from "../localdb"
import LogoHeader from "../components/LogoHeader"
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

interface OrderItem {
  itemId: string
  name: string
  variation: string
  price: number
  quantity: number
  modifiers?: string[]
  notes?: string
}

const TableOrderPage = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>()
  const tableNum: number = Number(tableNumber)

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
      console.warn("Variation must be selected before adding an item.");
      return;
    }
  
    const variation = selectedItem.variations.find((v) => v.type === selectedVariation);
    if (!variation) {
      console.warn("Invalid variation selection.");
      return;
    }
  
    let updatedOrder = order;
  
    // ✅ Ensure orderId is always a string
    if (!updatedOrder) {
      console.log(`No existing order found for table ${tableNum}. Creating new order...`);
  
      const newOrder: Order = {
        orderId: crypto.randomUUID(), // ✅ Guarantees a string orderId
        tableNumber: tableNum,
        items: [],
        totalPrice: 0,
        orderStatus: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      setOrder(newOrder);
      await handleOrderSubmission(newOrder);
      updatedOrder = newOrder;
    }
  
    // ✅ Ensure updatedOrder is not null
    if (!updatedOrder) {
      console.error("Order could not be created.");
      return;
    }
  
    // ✅ Add the item to the order
    const newItem: OrderItem = {
      itemId: selectedItem.itemId,
      name: selectedItem.name,
      variation: selectedVariation,
      price: variation.price,
      quantity: 1,
      modifiers: selectedModifiers.length > 0 ? selectedModifiers : undefined,
      notes: notes.trim() ? notes : undefined,
    };
  
    updatedOrder = {
      ...updatedOrder,
      items: [...updatedOrder.items, newItem],
      totalPrice: updatedOrder.totalPrice + variation.price,
    };
  
    setOrder(updatedOrder);
    await handleOrderSubmission(updatedOrder);
    setShowModal(false);
  };
  

  const handleRemoveItem = async (itemId: string) => {
    if (!order) return

    const updatedItems = order.items.filter((item) => item.itemId !== itemId)
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const updatedOrder = { ...order, items: updatedItems, totalPrice: newTotal }
    setOrder(updatedOrder)
    await removeOrderItem(order.orderId, itemId)
  }

  return (
    <div className="table-order-container">
      <div className="table-order-header">
        <LogoHeader />
        <h1 className="table-order-title">Table {tableNum}</h1>
      </div>

      <div className="table-order-layout">
        {/* ✅ Bill Section (Left Panel) */}
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
                <span>
                  {item.name} {item.variation}
                </span>
                <span>{item.quantity}</span>
                <span>£{item.price.toFixed(2)}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.itemId)}
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
            <button className="cancel-btn">Cancel</button>
            <button className="gratuity-btn">Gratuity</button>
            <button className="send-btn">Send</button>
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
            <div key={category.superCategory}>
              <button
                className="category-button"
                onClick={() => handleCategoryClick(category.superCategory)}
              >
                {category.superCategory}
              </button>
              {selectedCategory === category.superCategory &&
                category.subCategories.map((sub) => (
                  <button
                    key={sub}
                    className="subcategory-button"
                    onClick={() => fetchItems(sub)}
                  >
                    {sub}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Pop-up for Selecting Variations & Modifiers */}
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
            {selectedItem.variations.map((variation, idx) => (
              <label key={idx} className="variation-label">
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
