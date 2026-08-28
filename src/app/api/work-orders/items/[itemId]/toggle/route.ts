import { NextResponse } from "next/server";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { ToggleWorkOrderItemUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderItemUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const toggleUseCase = new ToggleWorkOrderItemUseCase(workOrderRepo);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const isCompleted = Boolean(body.isCompleted);
    const completedBy = body.completedBy || null;

    const updated = await toggleUseCase.execute({
      itemId,
      isCompleted,
      completedBy,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
