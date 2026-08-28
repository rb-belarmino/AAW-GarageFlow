import { NextResponse } from "next/server";
import { PrismaScheduleRepository } from "@/infrastructure/database/repositories/PrismaScheduleRepository";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { CreateScheduleUseCase } from "@/core/use-cases/schedule/CreateScheduleUseCase";

const scheduleRepo = new PrismaScheduleRepository();
const vehicleRepo = new PrismaVehicleRepository();
const createScheduleUseCase = new CreateScheduleUseCase(scheduleRepo, vehicleRepo);

export async function GET() {
  try {
    const schedules = await scheduleRepo.listActive();
    return NextResponse.json({ success: true, data: schedules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createScheduleUseCase.execute(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
