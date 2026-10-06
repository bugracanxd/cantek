import { Resend } from “resend”;

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = “CANTEK siparis@cantekshoes.com.tr”;
const ADMIN_EMAIL = “cantekshoes@gmail.com”;

function formatPrice(value) {
return ${Number(value || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2, })} TL;
}

function escapeHtml(value) {
return String(value ?? “”)
.replace(/&/g, “&”)
.replace(/</g, “<”)
.replace(/>/g, “>”)
.replace(/”/g, “"”)
.replace(/’/g, “'”);
}

function buildItemsHtml(items) {
return items
.map((item) => {
const furText = item.furSelected
? “ + Kürklü”
: “”;

  return `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        <strong>${escapeHtml(item.name)}</strong>
        ${furText
          ? `<div style="font-size:13px;color:#666;margin-top:4px;">${furText}</div>`
          : ""}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        ${escapeHtml(item.size)}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        ${escapeHtml(item.color || "-")}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
        ${formatPrice(item.unitPrice)}
      </td>
    </tr>
  `;
})
.join("");

}

function buildOrderHtml(order) {
return `
    <div style="padding:30px;border-bottom:1px solid #eee;">
      <div style="font-size:25px;font-weight:700;letter-spacing:2px;">
        CANTEK
      </div>
      <div style="margin-top:8px;color:#777;font-size:14px;">
        Sipariş Bilgilendirmesi
      </div>
    </div>
    <div style="padding:30px;">
      <h2 style="margin:0 0 10px;font-size:22px;">
        Sipariş #${escapeHtml(order.orderNumber)}
      </h2>
      <p style="color:#666;margin:0 0 25px;">
        Siparişiniz başarıyla alınmıştır.
      </p>
      <h3 style="font-size:16px;margin-bottom:12px;">
        Ürünler
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f7f7f5;">
            <th style="padding:12px;text-align:left;">Ürün</th>
            <th style="padding:12px;text-align:left;">Beden</th>
            <th style="padding:12px;text-align:left;">Renk</th>
            <th style="padding:12px;text-align:center;">Adet</th>
            <th style="padding:12px;text-align:right;">Fiyat</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsHtml(order.items)}
        </tbody>
      </table>
      <div style="margin-top:25px;border-top:1px solid #eee;padding-top:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span>Ara toplam</span>
          <strong>${formatPrice(order.subtotal)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span>Kargo</span>
          <strong>${formatPrice(order.shippingCost)}</strong>
        </div>
        ${
          Number(order.discount) > 0
            ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>İndirim</span>
                <strong>-${formatPrice(order.discount)}</strong>
              </div>
            `
            : ""
        }
        <div style="display:flex;justify-content:space-between;padding-top:15px;border-top:1px solid #ddd;font-size:18px;">
          <strong>Toplam</strong>
          <strong>${formatPrice(order.total)}</strong>
        </div>
      </div>
      <div style="margin-top:30px;padding:20px;background:#f7f7f5;">
        <h3 style="margin:0 0 12px;font-size:16px;">
          Teslimat Bilgileri
        </h3>
        <div style="font-size:14px;line-height:1.7;">
          <strong>${escapeHtml(order.customerName)}</strong><br/>
          ${escapeHtml(order.customerPhone)}<br/>
          ${escapeHtml(order.customerEmail)}<br/>
          ${escapeHtml(order.shippingAddress)}
        </div>
      </div>
      <p style="margin-top:30px;color:#777;font-size:13px;line-height:1.6;">
        Siparişiniz CANTEK tarafından hazırlanacaktır.
        Tahmini teslimat süresi 3–5 iş günüdür.
      </p>
    </div>
    <div style="padding:20px 30px;background:#fafafa;border-top:1px solid #eee;color:#888;font-size:12px;">
      © ${new Date().getFullYear()} CANTEK — cantekshoes.com.tr
    </div>
  </div>
</div>

`;
}

export async function sendOrderEmails(order) {
if (!process.env.RESEND_API_KEY) {
throw new Error(“RESEND_API_KEY environment variable is missing.”);
}

if (!order?.customerEmail) {
throw new Error(“Order customer email is missing.”);
}

const html = buildOrderHtml(order);

// –––––––––––––––––––––––––
// CUSTOMER EMAIL
// –––––––––––––––––––––––––

const customerEmail = await resend.emails.send({
from: FROM_EMAIL,
to: [order.customerEmail],
subject: CANTEK — Siparişiniz Alındı #${order.orderNumber},
html,
});

// –––––––––––––––––––––––––
// ADMIN EMAIL
// –––––––––––––––––––––––––

const adminEmail = await resend.emails.send({
from: FROM_EMAIL,
to: [ADMIN_EMAIL],
subject: CANTEK — Yeni Sipariş #${order.orderNumber},
html,
});

return {
customerEmail,
adminEmail,
};
}
