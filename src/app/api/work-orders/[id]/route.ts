import { NextResponse } from "next/server";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { UpdateWorkOrderUseCase } from "@/core/use-cases/work-order/UpdateWorkOrderUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const vehicleRepo = new PrismaVehicleRepository();
const updateWorkOrderUseCase = new UpdateWorkOrderUseCase(workOrderRepo, vehicleRepo);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workOrder = await workOrderRepo.findById(id);
    if (!workOrder) {
      return NextResponse.json({ success: false, error: "Work Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: workOrder });
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
    const updated = await updateWorkOrderUseCase.execute({
      id,
      ...body,
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
