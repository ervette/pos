import React, { useState } from "react"
import { Order } from "../localdb"
import { deleteOrder, updateOrderStatus } from "../services/archive.service"
import { generatePrintableBillHTML } from "../services/bill.service"
import "../styles/OrderOptionsModal.css"

interface Props {
  order: Order
  onClose: () => void
}

const OrderModal: React.FC<Props> = ({ order, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<
    "open" | "paid_other" | "paid_cash" | "paid_card" | "cancelled"
  >(order.orderStatus)

  const handleDelete = async () => {
    try {
      await deleteOrder(order._id as string)
      alert("Order deleted")
      window.location.reload() // 🔁 Refresh page to re-fetch orders
    } catch (err) {
      console.error("Failed to delete order", err)
    }
  }

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as
      | "open"
      | "paid_other"
      | "paid_cash"
      | "paid_card"
      | "cancelled"
    setSelectedStatus(newStatus)
    try {
      await updateOrderStatus(order._id as string, newStatus)
      onClose()
    } catch (err) {
      console.error("❌ Failed to update order status", err)
    }
  }

  const handlePrint = () => {
    const billHTML = generatePrintableBillHTML(order, "Server")
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(billHTML)
      printWindow.document.close()
    } else {
      alert("⚠️ Unable to open print window. Please check your popup blocker.")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button Top Left */}
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h3 className="modal-title">Order Options</h3>

        <div className="modal-actions">
          <button className="modal-btn" onClick={handlePrint}>
            Print Bill
          </button>

          <select
            className="status-select"
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            <option value="open">Open</option>
            <option value="paid_cash">Paid (Cash)</option>
            <option value="paid_card">Paid (Card)</option>
            <option value="paid_other">Paid (Other)</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button className="modal-btn delete-btn" onClick={handleDelete}>
            Delete Order
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderModal
