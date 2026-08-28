import { NextResponse } from "next/server";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { PrismaScheduleRepository } from "@/infrastructure/database/repositories/PrismaScheduleRepository";
import { GetDashboardMetricsUseCase } from "@/core/use-cases/dashboard/GetDashboardMetricsUseCase";

const vehicleRepo = new PrismaVehicleRepository();
const workOrderRepo = new PrismaWorkOrderRepository();
const scheduleRepo = new PrismaScheduleRepository();
const getMetricsUseCase = new GetDashboardMetricsUseCase(vehicleRepo, workOrderRepo, scheduleRepo);

export async function GET() {
  try {
    const metrics = await getMetricsUseCase.execute();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
