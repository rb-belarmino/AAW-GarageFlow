import { NextResponse } from "next/server";
import { PrismaScheduleRepository } from "@/infrastructure/database/repositories/PrismaScheduleRepository";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { EvaluateRecurringSchedulesUseCase } from "@/core/use-cases/schedule/EvaluateRecurringSchedulesUseCase";

const scheduleRepo = new PrismaScheduleRepository();
const vehicleRepo = new PrismaVehicleRepository();
const workOrderRepo = new PrismaWorkOrderRepository();
const evaluateUseCase = new EvaluateRecurringSchedulesUseCase(scheduleRepo, vehicleRepo, workOrderRepo);

export async function POST() {
  try {
    const result = await evaluateUseCase.execute(new Date());
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
