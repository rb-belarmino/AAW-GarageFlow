import { NextResponse } from "next/server";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { UpdateVehicleUseCase } from "@/core/use-cases/vehicle/UpdateVehicleUseCase";

const vehicleRepo = new PrismaVehicleRepository();
const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepo);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await vehicleRepo.findById(id);
    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: vehicle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateVehicleUseCase.execute({
      id,
      ...body,
      year: body.year !== undefined ? Number(body.year) : undefined,
      currentMileage: body.currentMileage !== undefined ? Number(body.currentMileage) : undefined,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}
