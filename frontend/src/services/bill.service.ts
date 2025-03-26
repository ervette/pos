// utils/generatePrintableBill.ts
import { Order } from "../localdb"

export const generatePrintableBillHTML = (
  order: Order,
  serverName: string
): string => {
  const now = new Date()
  const formattedTime = now.toLocaleString("en-GB", {
    hour12: false,
  })

  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>£${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("")

  return `
  <html>
    <head>
      <title>Bill</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #000;
        }
        h1, h2, h3 {
          text-align: center;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        .total {
          text-align: center;
          margin-top: 20px;
          font-size: 18px;
          font-weight: bold;
        }
        .thank-you {
          text-align: center;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Restaurant Name</h1>
      <h3>Sample Street, Postcode</h3>
      <h3>+44 1234 567 890</h3>
      <h3>VAT No: 1</h3>
      <h3>${serverName} | ${formattedTime}</h3>
      <h3 style="text-align: left;">Table No: ${order.tableNumber}</h3>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total">Total: £${order.totalPrice.toFixed(2)}</div>
      <div class="thank-you">Thank you!</div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
  </html>
  `
}
