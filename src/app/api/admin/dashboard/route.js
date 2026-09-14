import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalSalesAgg,
    todaySalesAgg,
    monthSalesAgg,
    orderCount,
    pendingOrders,
    paidOrders,
    failedOrders,
    productCount,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "paid", createdAt: { gte: startOfDay } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "paid", createdAt: { gte: startOfMonth } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAYMENT_PENDING" } }),
    prisma.order.count({ where: { paymentStatus: "paid" } }),
    prisma.order.count({ where: { paymentStatus: "payment_failed" } }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return NextResponse.json({
    totalSales: totalSalesAgg._sum.total || 0,
    todaySales: todaySalesAgg._sum.total || 0,
    monthSales: monthSalesAgg._sum.total || 0,
    orderCount,
    pendingOrders,
    paidOrders,
    failedOrders,
    productCount,
    lowStockProducts,
    recentOrders,
  });
}
