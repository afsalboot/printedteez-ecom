// utils/invoiceGenerator.js
module.exports = (order) => {
  const itemsHtml = order.items
    .map((item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      const total = price * qty;

      return `
      <tr>
        <td>${item.title} (${item.size})</td>
        <td style="text-align:center;">${qty}</td>
        <td style="text-align:right;">₹${price.toFixed(2)}</td>
        <td style="text-align:right;">₹${total.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const subTotal = Number(order.subTotal) || 0;
  const discount = Number(order.couponApplied?.discountAmount) || 0;
  const total = subTotal - discount;

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="text-align:center;">🧾 Order Invoice</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <hr />

      <h3>Shipping Address</h3>
      <p>
        ${order.shippingAddress?.name || ""}<br/>
        ${order.shippingAddress?.line1 || ""}<br/>
        ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""}<br/>
        ${order.shippingAddress?.postalCode || ""}, ${order.shippingAddress?.country || ""}<br/>
        Phone: ${order.shippingAddress?.phone || ""}
      </p>

      <h3>Order Details</h3>
      <table border="1" cellspacing="0" cellpadding="8" width="100%" style="border-collapse:collapse;">
        <thead style="background:#f8f8f8;">
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <h3 style="text-align:right; margin-top:20px;">
        Subtotal: ₹${subTotal.toFixed(2)}<br/>
        Discount: ₹${discount.toFixed(2)}<br/>
        <strong>Total: ₹${total.toFixed(2)}</strong>
      </h3>

      <p style="text-align:center; margin-top:30px;">
        Thank you for shopping with <strong>PrintedTeez</strong> 💙
      </p>
    </div>
  `;
};
