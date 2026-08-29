import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { ToggleWorkOrderItemUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderItemUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const toggleUseCase = new ToggleWorkOrderItemUseCase(workOrderRepo);

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
    const isCompleted = Boolean(body.isCompleted);

    // Server-side audit attribution: use session user identity
    const sessionUserName = session.user.name || session.user.username;
    const completedBy = isCompleted ? (body.completedBy?.trim() || sessionUserName || null) : null;

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
