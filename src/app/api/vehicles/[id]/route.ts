import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { UpdateVehicleUseCase } from "@/core/use-cases/vehicle/UpdateVehicleUseCase";
import { DeleteVehicleUseCase } from "@/core/use-cases/vehicle/DeleteVehicleUseCase";

const vehicleRepo = new PrismaVehicleRepository();
const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepo);
const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepo);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
    }

    const updated = await updateVehicleUseCase.execute({
      id,
      ...body,
      year: body.year !== undefined ? Number(body.year) : undefined,
      currentMileage: body.currentMileage !== undefined ? Math.max(0, Number(body.currentMileage)) : undefined,
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Only MANAGER or ADMIN role can delete vehicles
    const userRole = session.user.role;
    if (userRole !== "MANAGER" && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Only Managers and Administrators have permission to delete vehicles." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteVehicleUseCase.execute(id);
    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

