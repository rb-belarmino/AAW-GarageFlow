import { NextResponse } from "next/server";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { ToggleWorkOrderDoneUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderDoneUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const toggleWorkOrderDoneUseCase = new ToggleWorkOrderDoneUseCase(workOrderRepo);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const isDone = Boolean(body.isDone);
    const completedBy = body.completedBy || null;

    const updated = await toggleWorkOrderDoneUseCase.execute({
      workOrderId: id,
      isDone,
      completedBy,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
