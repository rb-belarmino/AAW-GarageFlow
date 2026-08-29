import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || !body.vehicleId) {
      return NextResponse.json({ success: false, error: "Vehicle ID is required" }, { status: 400 });
    }

    const created = await createWorkOrderUseCase.execute({
      vehicleId: String(body.vehicleId).trim(),
      tasks: body.tasks,
      notes: body.notes ? String(body.notes).trim() : null,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
