import { NextResponse } from "next/server";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { ListVehiclesUseCase } from "@/core/use-cases/vehicle/ListVehiclesUseCase";

const vehicleRepo = new PrismaVehicleRepository();
const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepo);
const listVehiclesUseCase = new ListVehiclesUseCase(vehicleRepo);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const sourceTag = searchParams.get("sourceTag") || undefined;

    const vehicles = await listVehiclesUseCase.execute({ search, status, sourceTag });
    return NextResponse.json({ success: true, data: vehicles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createVehicleUseCase.execute(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
