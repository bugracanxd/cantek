import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const validStatuses = [
  "PAYMENT_PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export async function PATCH(req, { params }) {
  try {
    const { status } = await req.json();

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Geçersiz sipariş durumu." },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Güncelleme başarısız." },
      { status: 500 }
    );
  }
}
