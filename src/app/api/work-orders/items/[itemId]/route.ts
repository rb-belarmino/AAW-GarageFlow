import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { UpdateWorkOrderItemUseCase } from "@/core/use-cases/work-order/UpdateWorkOrderItemUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const updateItemUseCase = new UpdateWorkOrderItemUseCase(workOrderRepo);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await request.json();
    const updated = await updateItemUseCase.execute({
      itemId,
      notes: body.notes !== undefined ? body.notes : undefined,
      taskText: body.taskText !== undefined ? body.taskText : undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
