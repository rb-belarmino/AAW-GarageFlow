import { NextResponse } from "next/server";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { ListWorkOrdersUseCase } from "@/core/use-cases/work-order/ListWorkOrdersUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const vehicleRepo = new PrismaVehicleRepository();
const createWorkOrderUseCase = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
const listWorkOrdersUseCase = new ListWorkOrdersUseCase(workOrderRepo);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const vehicleId = searchParams.get("vehicleId") || undefined;
    const isDoneParam = searchParams.get("isDone");
    const isDone = isDoneParam !== null ? isDoneParam === "true" : undefined;

    const workOrders = await listWorkOrdersUseCase.execute({ search, vehicleId, isDone });
    return NextResponse.json({ success: true, data: workOrders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createWorkOrderUseCase.execute(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
