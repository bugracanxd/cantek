import crypto from "crypto";

/**
 * PAYTR iFrame API entegrasyonu
 * Server tarafında çalıştırılmalıdır.
 */

const PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";

function getEnv() {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
  const testMode = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error(
      "PAYTR bilgileri eksik: PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT tanımlı olmalı."
    );
  }

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
  };
}

// PAYTR merchant_oid sadece harf ve rakamlardan oluşmalı
export function toMerchantOid(orderNumber) {
  return String(orderNumber).replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * PAYTR iframe token oluşturur.
 */
export async function createPaytrToken({
  order,
  userIp,
  userBasket,
  noInstallment = 0,
  maxInstallment = 0,
}) {
  const {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
  } = getEnv();

  // Site adresi
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL eksik. Vercel Environment Variables bölümüne sitenin tam adresini ekleyin."
    );
  }

  const merchantOid = toMerchantOid(order.orderNumber);

  // PAYTR kuruş cinsinden tutar bekler
  const paymentAmount = Math.round(Number(order.total) * 100);

  // Sepeti Base64 formatına çevir
  const basketJson = Buffer.from(
    JSON.stringify(userBasket)
  ).toString("base64");

  const merchantOkUrl =
    `${siteUrl}/checkout/success?order=${encodeURIComponent(
      order.orderNumber
    )}`;

  const merchantFailUrl =
    `${siteUrl}/checkout/failed?order=${encodeURIComponent(
      order.orderNumber
    )}`;

  const currency = "TL";

  /*
   * PAYTR token hash
   *
   * merchant_id
   * + user_ip
   * + merchant_oid
   * + email
   * + payment_amount
   * + user_basket
   * + no_installment
   * + max_installment
   * + currency
   * + test_mode
   * + merchant_salt
   */
  const hashStr =
    merchantId +
    userIp +
    merchantOid +
    order.customerEmail +
    paymentAmount +
    basketJson +
    noInstallment +
    maxInstallment +
    currency +
    testMode;

  const paytrToken = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");

  // PAYTR'ye gönderilecek bilgiler
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

    user_name: order.customerName || "",
    user_address: order.shippingAddress || "",
    user_phone: order.customerPhone || "",

    // Ödeme başarılı olduğunda
    merchant_ok_url: merchantOkUrl,

    // Ödeme başarısız olduğunda
    merchant_fail_url: merchantFailUrl,

    timeout_limit: "30",

    currency,

    test_mode: testMode,
  });

  const res = await fetch(PAYTR_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const json = await res.json();

  if (json.status !== "success") {
    throw new Error(
      `PAYTR token hatası: ${
        json.reason || "bilinmeyen hata"
      }`
    );
  }

  return {
    token: json.token,
    merchantOid,
  };
}

/**
 * PAYTR callback doğrulaması.
 */
export function verifyPaytrCallback(params) {
  const {
    merchantKey,
    merchantSalt,
  } = getEnv();

  const {
    merchant_oid,
    status,
    total_amount,
    hash,
  } = params;

  const calculatedHashStr =
    merchant_oid +
    merchantSalt +
    status +
    total_amount;

  const calculatedHash = crypto
    .createHmac("sha256", merchantKey)
    .update(calculatedHashStr)
    .digest("base64");

  return calculatedHash === hash;
}
