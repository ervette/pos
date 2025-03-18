import React, { useState } from "react"
import { Order } from "../localdb"
import OrderModal from "./OrderOptionsModal"
import "../styles/ArchivePage.css"

interface Props {
  order: Order
}

const OrderRow: React.FC<Props> = ({ order }) => {
  const [showModal, setShowModal] = useState(false)

  const formattedDate = new Date(order.createdAt).toLocaleString()

  return (
    <>
      <div className="table-row">
        <span>{order.tableNumber}</span>
        <span>{formattedDate}</span>
        <span>{order.orderStatus}</span>
        <span>
          <button onClick={() => setShowModal(true)}>⋮</button>
        </span>
      </div>
      {showModal && (
        <OrderModal order={order} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

export default OrderRow
