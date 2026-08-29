import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { ToggleWorkOrderDoneUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderDoneUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const toggleWorkOrderDoneUseCase = new ToggleWorkOrderDoneUseCase(workOrderRepo);

export async function PATCH(
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
    const isDone = Boolean(body.isDone);
    
    // Server-side audit attribution: use session user identity
    const sessionUserName = session.user.name || session.user.username;
    const completedBy = isDone ? (body.completedBy?.trim() || sessionUserName || null) : null;

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
