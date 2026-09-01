import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { AddWorkOrderItemUseCase } from "@/core/use-cases/work-order/AddWorkOrderItemUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const addUseCase = new AddWorkOrderItemUseCase(workOrderRepo);

export async function POST(
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
    const taskText = typeof body?.taskText === "string" ? body.taskText.trim() : "";
    const notes = typeof body?.notes === "string" ? body.notes.trim() : null;

    if (!taskText) {
      return NextResponse.json({ success: false, error: "Task description cannot be empty" }, { status: 400 });
    }

    const item = await addUseCase.execute({
      workOrderId: id,
      taskText,
      notes,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
