import crypto from "crypto";

/**
 * PAYTR iFrame API entegrasyonu
 *
 * Bu dosya SADECE server tarafında çalışmalıdır.
 *
 * PAYTR ödeme tutarı frontend'den alınmaz.
 * Sipariş DB'de oluşturulduktan sonra order.total
 * üzerinden hesaplanır.
 */

const PAYTR_TOKEN_URL =
  "https://www.paytr.com/odeme/api/get-token";

const PAYTR_CURRENCY = "TL";

/**
 * PAYTR environment değişkenlerini alır.
 */
function getEnv() {
  const merchantId =
    process.env.PAYTR_MERCHANT_ID;

  const merchantKey =
    process.env.PAYTR_MERCHANT_KEY;

  const merchantSalt =
    process.env.PAYTR_MERCHANT_SALT;

  const testMode =
    process.env.PAYTR_TEST_MODE === "1"
      ? "1"
      : "0";

  if (
    !merchantId ||
    !merchantKey ||
    !merchantSalt
  ) {
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

/**
 * PAYTR merchant_oid yalnızca harf ve rakamlardan
 * oluşmalıdır.
 */
export function toMerchantOid(orderNumber) {
  const merchantOid = String(orderNumber)
    .replace(/[^a-zA-Z0-9]/g, "");

  if (!merchantOid) {
    throw new Error(
      "Geçerli bir PAYTR merchant_oid oluşturulamadı."
    );
  }

  return merchantOid;
}

/**
 * HMAC-SHA256 + Base64
 */
function createHmacBase64(secret, value) {
  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64");
}

/**
 * Güvenli hash karşılaştırması.
 *
 * timingSafeEqual kullanılır.
 */
function safeCompareHash(
  receivedHash,
  calculatedHash
) {
  if (
    typeof receivedHash !== "string" ||
    typeof calculatedHash !== "string"
  ) {
    return false;
  }

  const receivedBuffer =
    Buffer.from(receivedHash, "utf8");

  const calculatedBuffer =
    Buffer.from(calculatedHash, "utf8");

  if (
    receivedBuffer.length !==
    calculatedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    calculatedBuffer
  );
}

/**
 * PAYTR iFrame token oluşturur.
 */
export async function createPaytrToken({
  order,
  userIp,
  userBasket,
  noInstallment = 0,
  maxInstallment = 0,
}) {
  // --------------------------------------------------
  // ENV
  // --------------------------------------------------

  const {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
  } = getEnv();

  // --------------------------------------------------
  // VALIDATE ORDER
  // --------------------------------------------------

  if (!order?.id) {
    throw new Error(
      "PAYTR için geçerli bir sipariş gerekli."
    );
  }

  if (!order.orderNumber) {
    throw new Error(
      "Sipariş numarası bulunamadı."
    );
  }

  if (!order.customerEmail) {
    throw new Error(
      "Sipariş e-posta adresi bulunamadı."
    );
  }

  if (!userIp) {
    throw new Error(
      "Kullanıcı IP adresi bulunamadı."
    );
  }

  // --------------------------------------------------
  // SITE URL
  // --------------------------------------------------

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(
      /\/$/,
      ""
    );

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL eksik. Vercel Environment Variables bölümüne sitenin tam adresini ekleyin."
    );
  }

  // --------------------------------------------------
  // MERCHANT OID
  // --------------------------------------------------

  const merchantOid = toMerchantOid(
    order.orderNumber
  );

  // --------------------------------------------------
  // PAYMENT AMOUNT
  // --------------------------------------------------

  /*
   * PAYTR kuruş cinsinden integer tutar bekler.
   *
   * Örnek:
   *
   * 3500.00 TL
   * =>
   * 350000
   *
   * order.total server tarafında hesaplanmış
   * güvenilir DB değeridir.
   */

  const numericTotal =
    Number(order.total);

  if (
    !Number.isFinite(numericTotal) ||
    numericTotal <= 0
  ) {
    throw new Error(
      "PAYTR için geçerli bir sipariş toplamı bulunamadı."
    );
  }

  const paymentAmount = Math.round(
    numericTotal * 100
  );

  if (
    !Number.isInteger(paymentAmount) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "PAYTR ödeme tutarı geçersiz."
    );
  }

  // --------------------------------------------------
  // BASKET
  // --------------------------------------------------

  if (!Array.isArray(userBasket)) {
    throw new Error(
      "PAYTR sepet bilgisi geçersiz."
    );
  }

  if (userBasket.length === 0) {
    throw new Error(
      "PAYTR sepeti boş olamaz."
    );
  }

  /*
   * Basket içerisindeki değerleri PAYTR'nin
   * beklediği formata normalize ediyoruz.
   *
   * Örneğin kürklü ürün:
   *
   * ["Hakiki Deri Ayakkabı", "3500.00", 1]
   *
   * şeklinde gider.
   */

  const normalizedBasket =
    userBasket.map((item) => {
      if (
        !Array.isArray(item) ||
        item.length < 3
      ) {
        throw new Error(
          "PAYTR sepet ürünü geçersiz."
        );
      }

      const name = String(
        item[0] ?? ""
      ).trim();

      const price = Number(item[1]);

      const quantity = Number(item[2]);

      if (!name) {
        throw new Error(
          "PAYTR sepetinde ürün adı bulunamadı."
        );
      }

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error(
          `PAYTR sepetinde geçersiz ürün fiyatı: ${name}`
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          `PAYTR sepetinde geçersiz ürün adedi: ${name}`
        );
      }

      return [
        name,
        price.toFixed(2),
        quantity,
      ];
    });

  // --------------------------------------------------
  // BASE64 BASKET
  // --------------------------------------------------

  const basketJson = Buffer.from(
    JSON.stringify(normalizedBasket)
  ).toString("base64");

  // --------------------------------------------------
  // SUCCESS / FAIL URL
  // --------------------------------------------------

  const merchantOkUrl =
    `${siteUrl}/checkout/success?order=${encodeURIComponent(
      order.orderNumber
    )}`;

  const merchantFailUrl =
    `${siteUrl}/checkout/failed?order=${encodeURIComponent(
      order.orderNumber
    )}`;

  // --------------------------------------------------
  // PAYTR HASH
  // --------------------------------------------------

  /*
   * PAYTR token hash:
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
    PAYTR_CURRENCY +
    testMode;

  const paytrToken =
    createHmacBase64(
      merchantKey,
      hashStr + merchantSalt
    );

  // --------------------------------------------------
  // PAYTR REQUEST BODY
  // --------------------------------------------------

  const body = new URLSearchParams({
    merchant_id: merchantId,

    user_ip: userIp,

    merchant_oid: merchantOid,

    email: order.customerEmail,

    payment_amount:
      String(paymentAmount),

    paytr_token: paytrToken,

    user_basket: basketJson,

    debug_on: "1",

    no_installment:
      String(noInstallment),

    max_installment:
      String(maxInstallment),

    user_name:
      order.customerName || "",

    user_address:
      order.shippingAddress || "",

    user_phone:
      order.customerPhone || "",

    merchant_ok_url:
      merchantOkUrl,

    merchant_fail_url:
      merchantFailUrl,

    timeout_limit: "30",

    currency:
      PAYTR_CURRENCY,

    test_mode:
      testMode,
  });

  // --------------------------------------------------
  // PAYTR API REQUEST
  // --------------------------------------------------

  let response;

  try {
    response = await fetch(
      PAYTR_TOKEN_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: body.toString(),

        cache: "no-store",
      }
    );
  } catch (error) {
    console.error(
      "PAYTR API bağlantı hatası:",
      error
    );

    throw new Error(
      "PAYTR sunucusuna bağlanılamadı."
    );
  }

  // --------------------------------------------------
  // PAYTR RESPONSE
  // --------------------------------------------------

  let json;

  try {
    json = await response.json();
  } catch {
    throw new Error(
      `PAYTR geçersiz yanıt verdi. HTTP ${response.status}`
    );
  }

  if (
    !response.ok ||
    json?.status !== "success"
  ) {
    console.error(
      "PAYTR token response:",
      json
    );

    throw new Error(
      `PAYTR token hatası: ${
        json?.reason ||
        `HTTP ${response.status}` ||
        "bilinmeyen hata"
      }`
    );
  }

  if (!json.token) {
    throw new Error(
      "PAYTR token yanıtı boş geldi."
    );
  }

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  return {
    token: json.token,
    merchantOid,
  };
}

/**
 * PAYTR callback doğrulaması.
 *
 * PAYTR callback hash:
 *
 * merchant_oid
 * + merchant_salt
 * + status
 * + total_amount
 *
 * HMAC-SHA256 / Base64
 */
export function verifyPaytrCallback(params) {
  try {
    const {
      merchantKey,
      merchantSalt,
    } = getEnv();

    if (!params) {
      return false;
    }

    const merchantOid =
      params.merchant_oid?.toString();

    const status =
      params.status?.toString();

    const totalAmount =
      params.total_amount?.toString();

    const receivedHash =
      params.hash?.toString();

    if (
      !merchantOid ||
      !status ||
      !totalAmount ||
      !receivedHash
    ) {
      return false;
    }

    const calculatedHashStr =
      merchantOid +
      merchantSalt +
      status +
      totalAmount;

    const calculatedHash =
      createHmacBase64(
        merchantKey,
        calculatedHashStr
      );

    return safeCompareHash(
      receivedHash,
      calculatedHash
    );
  } catch (error) {
    console.error(
      "PAYTR callback hash doğrulama hatası:",
      error
    );

    return false;
  }
}
