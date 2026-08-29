import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { ListVehiclesUseCase } from "@/core/use-cases/vehicle/ListVehiclesUseCase";

const vehicleRepo = new PrismaVehicleRepository();
const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepo);
const listVehiclesUseCase = new ListVehiclesUseCase(vehicleRepo);

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
    }

    const created = await createVehicleUseCase.execute({
      vin: String(body.vin || "").trim(),
      year: Number(body.year),
      make: String(body.make || "").trim(),
      model: String(body.model || "").trim(),
      trim: body.trim ? String(body.trim).trim() : null,
      color: body.color ? String(body.color).trim() : "Unspecified",
      licensePlate: body.licensePlate ? String(body.licensePlate).trim().toUpperCase() : null,
      currentMileage: body.currentMileage !== undefined ? Math.max(0, Number(body.currentMileage)) : 0,
      sourceTag: body.sourceTag ? String(body.sourceTag).trim() : "AAW Dealer",
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
