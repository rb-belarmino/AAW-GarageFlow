import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { GetDashboardMetricsUseCase } from "@/core/use-cases/dashboard/GetDashboardMetricsUseCase";

const vehicleRepo = new PrismaVehicleRepository();
const workOrderRepo = new PrismaWorkOrderRepository();
const getMetricsUseCase = new GetDashboardMetricsUseCase(vehicleRepo, workOrderRepo);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const metrics = await getMetricsUseCase.execute();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
