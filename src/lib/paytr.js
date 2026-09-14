import crypto from "crypto";

/**
 * PAYTR iFrame API entegrasyonu (resmi dokümantasyona göre).
 * https://dev.paytr.com/iframe-api
 *
 * Bu modül SADECE server tarafında (API route'ları içinden) çağrılmalı.
 * Merchant key/salt hiçbir zaman client'a gönderilmez.
 */

const PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";

function getEnv() {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
  const testMode = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error(
      "PAYTR bilgileri eksik: .env dosyasında PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT tanımlı olmalı."
    );
  }
  return { merchantId, merchantKey, merchantSalt, testMode };
}

// PAYTR sipariş numarası sadece harf/rakamdan oluşmalı (özel karakter yasak)
export function toMerchantOid(orderNumber) {
  return orderNumber.replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * PAYTR'den iframe token'ı alır. order: bizim Order kaydımız,
 * userBasket: [[ürün adı, birim fiyat(TL string), adet], ...]
 */
export async function createPaytrToken({ order, userIp, userBasket, noInstallment = 0, maxInstallment = 0 }) {
  const { merchantId, merchantKey, merchantSalt, testMode } = getEnv();

  const merchantOid = toMerchantOid(order.orderNumber);
  // PAYTR "kuruş" cinsinden tam sayı bekler
  const paymentAmount = Math.round(order.total * 100);
  const basketJson = Buffer.from(JSON.stringify(userBasket)).toString("base64");

  const merchantOkUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${order.orderNumber}`;
  const merchantFailUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failed?order=${order.orderNumber}`;

  const hashStr =
    merchantId +
    userIp +
    merchantOid +
    order.customerEmail +
    paymentAmount +
    basketJson +
    noInstallment +
    maxInstallment +
    testMode;

  const paytrToken = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");

  const body = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email: order.customerEmail,
    payment_amount: String(paymentAmount),
    paytr_token: paytrToken,
    user_basket: basketJson,
    debug_on: "1",
    no_installment: String(noInstallment),
    max_installment: String(maxInstallment),
    user_name: order.customerName,
    user_address: order.shippingAddress,
    user_phone: order.customerPhone,
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    timeout_limit: "30",
    currency: "TL",
    test_mode: testMode,
  });

  const res = await fetch(PAYTR_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(`PAYTR token hatası: ${json.reason || "bilinmeyen hata"}`);
  }
  return { token: json.token, merchantOid };
}

/**
 * PAYTR callback (notification) doğrulaması.
 * PAYTR bu endpoint'e POST ile bildirim gönderir; biz hash'i doğrulayıp
 * "OK" düz metni döndürmek ZORUNDAYIZ, aksi halde PAYTR tekrar tekrar dener.
 */
export function verifyPaytrCallback(params) {
  const { merchantKey, merchantSalt } = getEnv();
  const { merchant_oid, status, total_amount, hash } = params;

  const calculatedHashStr = merchant_oid + merchantSalt + status + total_amount;
  const calculatedHash = crypto
    .createHmac("sha256", merchantKey)
    .update(calculatedHashStr)
    .digest("base64");

  return calculatedHash === hash;
}
