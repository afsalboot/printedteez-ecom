const YEAR = new Date().getFullYear();
const BRAND_NAME = "PrintedTeez";
const FRONTEND = process.env.FRONTEND_URL || "https://printedteez.com";

module.exports = {
  /* ---------------------- SHARED WRAPPER ---------------------- */
  _wrap(preheader, innerHtml) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${BRAND_NAME}</title>
  <style>
    :root {
      --bg: #f3f5f9;
      --card: #ffffff;
      --accent: #ff3b3b;
      --accent-gradient: linear-gradient(90deg,#ff3b3b,#ff6f61);
      --blue-gradient: linear-gradient(90deg,#0066ff,#00c4ff);
      --dark-gradient: linear-gradient(90deg,#111827,#333);
      --text: #0f172a;
      --muted: #6b7280;
    }

    html, body { margin:0; padding:0; background:var(--bg); font-family:'Segoe UI',Roboto,Arial,sans-serif; }
    a { color:inherit; text-decoration:none; }
    img { border:0; display:block; max-width:100%; height:auto; }

    .email-wrap { padding:20px 16px; background:var(--bg); }
    .email-container {
      max-width:680px; margin:auto; background:var(--card);
      border-radius:14px; overflow:hidden;
      box-shadow:0 8px 30px rgba(0,0,0,0.08);
    }

    .header {
      padding:26px 24px; text-align:center;
      color:white; font-weight:700; font-size:22px;
      letter-spacing:0.4px; background:var(--accent-gradient);
    }

    .content { padding:30px; color:var(--text); text-align:left; }
    h1 { margin:0 0 10px; font-size:24px; }
    p { margin:0 0 16px; line-height:1.6; color:var(--muted); font-size:15px; }

    .button {
      display:inline-block;
      background:var(--accent-gradient);
      color:#fff;
      text-decoration:none;
      padding:14px 28px;
      border-radius:50px;
      font-weight:700;
      font-size:15px;
      letter-spacing:0.3px;
      transition:opacity 0.3s ease;
    }

    .button:hover { opacity:0.9; }

    .footer {
      background:#f8fafc;
      padding:20px;
      text-align:center;
      color:var(--muted);
      font-size:13px;
    }

    @media (max-width:520px) {
      .content { padding:20px; }
      h1 { font-size:20px; }
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0px;overflow:hidden;">${preheader}</div>
  <table class="email-wrap" role="presentation" width="100%">
    <tr><td align="center">
      <table class="email-container" role="presentation" width="100%">
        ${innerHtml}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  },

  /* ---------------------- VERIFY EMAIL ---------------------- */
  verifyEmail(name, link) {
    const pre = `Verify your ${BRAND_NAME} account — tap to confirm your email.`;
    const inner = `
    <tr><td class="header">${BRAND_NAME} Verification</td></tr>
    <tr>
      <td class="content" align="center">
        <h1>Welcome, ${name} 👋</h1>
        <p>Thanks for joining <strong>${BRAND_NAME}</strong>! Confirm your email below to activate your account and start shopping.</p>
        <p><a href="${link}" class="button" target="_blank">Verify My Email</a></p>
        <p style="font-size:13px;color:var(--muted)">This link expires in 1 hour. If this wasn’t you, please ignore.</p>
      </td>
    </tr>
    <tr><td class="footer">© ${YEAR} ${BRAND_NAME} • <a href="${FRONTEND}" style="color:inherit;text-decoration:underline;">Visit Store</a></td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- WELCOME EMAIL ---------------------- */
  welcomeEmail(name) {
    const pre = `Welcome to ${BRAND_NAME}! Explore designs and offers.`;
    const inner = `
    <tr><td class="header" style="background:var(--blue-gradient)">Welcome to ${BRAND_NAME}</td></tr>
    <tr>
      <td class="content" align="center">
        <h1>Hi ${name}, glad you're here 🎉</h1>
        <p>Start customizing tees, discover limited drops, and enjoy exclusive deals only for you.</p>
        <a href="${FRONTEND}" class="button" style="background:var(--blue-gradient)">Start Shopping</a>
      </td>
    </tr>
    <tr><td class="footer">© ${YEAR} ${BRAND_NAME}</td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- INVOICE EMAIL ---------------------- */
  invoiceEmail(orderHtml, name = 'Customer') {
    const pre = `Thanks for your order — here's your invoice from ${BRAND_NAME}.`;
    const inner = `
    <tr><td class="header" style="background:var(--blue-gradient)">${BRAND_NAME} — Order Receipt</td></tr>
    <tr>
      <td class="content">
        <h1>Thanks for your purchase, ${name} 👏</h1>
        <p>We’ve received your order and are getting it ready. Below is a summary:</p>
        <div style="background:#fafafa;padding:14px;border-radius:10px;margin:14px 0;box-shadow:inset 0 0 8px rgba(0,0,0,0.04);">${orderHtml}</div>
        <p style="text-align:center;margin-top:18px;"><a href="${FRONTEND}/orders" class="button" style="background:var(--blue-gradient)">View My Orders</a></p>
      </td>
    </tr>
    <tr><td class="footer">Questions? Contact <a href="mailto:support@printedteez.com">support@printedteez.com</a> — © ${YEAR} ${BRAND_NAME}</td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- PASSWORD RESET ---------------------- */
  resetPassword(name, link) {
    const pre = `Reset your ${BRAND_NAME} password — quick and secure.`;
    const inner = `
    <tr><td class="header" style="background:var(--accent-gradient)">${BRAND_NAME} — Password Help</td></tr>
    <tr>
      <td class="content" align="center">
        <h1>Password Reset Requested</h1>
        <p>Hi ${name}, we received a request to reset your password. Tap below to continue. This link expires in 1 hour.</p>
        <p><a href="${link}" class="button">Reset Password</a></p>
        <p style="font-size:13px;color:var(--muted)">If you didn't request a reset, ignore this email.</p>
        <p style="font-size:12px;color:var(--muted);word-break:break-all;margin-top:14px"><a href="${link}">${link}</a></p>
      </td>
    </tr>
    <tr><td class="footer">&copy; ${YEAR} ${BRAND_NAME}</td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- PASSWORD CHANGED ---------------------- */
  passwordChanged(name) {
    const pre = `Your ${BRAND_NAME} password was changed.`;
    const inner = `
    <tr><td class="header" style="background:var(--accent-gradient)">${BRAND_NAME}</td></tr>
    <tr><td class="content" align="center">
      <h1>Password Changed</h1>
      <p>Hi ${name}, your password has been updated. If you didn’t make this change, please contact support immediately.</p>
      <a href="mailto:support@printedteez.com" class="button" style="background:var(--blue-gradient)">Contact Support</a>
    </td></tr>
    <tr><td class="footer">&copy; ${YEAR} ${BRAND_NAME} • Stay safe!</td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- PASSWORD RESET SUCCESS ---------------------- */
  passwordResetSuccess(name = 'there') {
    const pre = `Your password was reset successfully.`;
    const inner = `
    <tr><td class="header" style="background:var(--blue-gradient)">${BRAND_NAME}</td></tr>
    <tr><td class="content" align="center">
      <h1>Password Reset Successful 🎉</h1>
      <p>Hi ${name}, your password was reset successfully. You can now log in with your new credentials.</p>
      <a href="${FRONTEND}/login" class="button" style="background:var(--blue-gradient)">Go to Login</a>
    </td></tr>
    <tr><td class="footer">&copy; ${YEAR} ${BRAND_NAME}</td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- ORDER CANCELLED ---------------------- */
  orderCancelled(name, orderId) {
    const pre = `Your ${BRAND_NAME} order #${orderId} was cancelled.`;
    const inner = `
    <tr><td class="header" style="background:var(--accent-gradient)">Order Cancelled</td></tr>
    <tr><td class="content" align="center">
      <h1>We're sorry to see this</h1>
      <p>Hello ${name}, your order <strong>#${orderId}</strong> has been cancelled. If this was a mistake, please contact support.</p>
      <a href="mailto:support@printedteez.com" class="button" style="background:var(--dark-gradient)">Contact Support</a>
    </td></tr>
    <tr><td class="footer">&copy; ${YEAR} ${BRAND_NAME}</td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- PROMOTION EMAIL ---------------------- */
  promotionEmail(name, code, amount, expiryDate, description) {
    const pre = `Exclusive ${amount} OFF for you — use ${code} before ${expiryDate}.`;
    const inner = `
    <tr><td class="header" style="background:var(--blue-gradient)">🔥 Special Offer</td></tr>
    <tr><td class="content" align="center">
      <h1>${name ? `Hey ${name}` : "Hey there"}, your exclusive deal is here!</h1>
      <p style="color:var(--muted);">${description}</p>
      <div style="margin:18px 0;display:inline-block;padding:10px 24px;border-radius:10px;background:#f3f9ff;font-weight:700;color:#0066ff;font-size:20px;box-shadow:inset 0 0 10px rgba(0,0,0,0.05);">${code}</div>
      <p style="font-size:13px;color:var(--muted);margin-top:8px;">Valid until <strong>${expiryDate}</strong></p>
      <a href="${FRONTEND}" class="button" style="background:var(--blue-gradient)">Shop Now</a>
    </td></tr>
    <tr><td class="footer">You’re receiving this as a valued ${BRAND_NAME} customer. <a href="#">Unsubscribe</a></td></tr>`;
    return this._wrap(pre, inner);
  },

  /* ---------------------- NEW ARRIVAL EMAIL ---------------------- */
  newArrivalEmail(name, productTitle, productImage, productLink, description = "") {
    const pre = `🔥 New Arrival: ${productTitle} just dropped at ${BRAND_NAME}!`;
    const inner = `
    <tr><td class="header" style="background:var(--dark-gradient)">🆕 New Arrival</td></tr>
    <tr>
      <td class="content" align="center">
        <h1>${name ? `Hey ${name}` : "Hello"}, check this out 👕</h1>
        <p style="color:var(--muted);margin-bottom:18px;">Something fresh just landed at ${BRAND_NAME}.</p>
        <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">
          <img src="${productImage}" alt="${productTitle}" style="width:100%;max-height:420px;object-fit:cover;">
          <div style="padding:16px;text-align:left;">
            <h3 style="margin:0 0 6px;font-size:18px;color:var(--text);">${productTitle}</h3>
            ${
              description
                ? `<p style="margin:0 0 12px;color:var(--muted);font-size:14px;">${description}</p>`
                : ""
            }
            <div style="text-align:center;margin-top:16px;">
              <a href="${productLink}" class="button">View Product</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
    <tr><td class="footer">© ${YEAR} ${BRAND_NAME} • <a href="${FRONTEND}">Visit Store</a></td></tr>`;
    return this._wrap(pre, inner);
  },
};
