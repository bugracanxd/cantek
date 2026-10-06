import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";

export async function GET() {
  try {
    const testOrder = {
      orderNumber: "TEST-001",
      customerName: "CANTEK Test",
      customerEmail: "cantekshoes@gmail.com",
      customerPhone: "0555 555 55 55",
      shippingAddress:
        "CANTEK Test Adresi, İstanbul, Türkiye",

      subtotal: 3000,
      shippingCost: 0,
      discount: 0,
      total: 3000,

      items: [
        {
          name: "CANTEK Test Model",
          size: "42",
          color: "Siyah",
          quantity: 1,
          unitPrice: 3000,
          furSelected: false,
        },
      ],
    };

    const result = await sendOrderEmails(testOrder);

    return NextResponse.json({
      success: true,
      message: "Test mailleri başarıyla gönderildi.",
      result,
    });
  } catch (error) {
    console.error("Test email error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message || "Test maili gönderilemedi.",
      },
      {
        status: 500,
      }
    );
  }
}
