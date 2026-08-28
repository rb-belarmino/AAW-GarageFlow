import { NextResponse } from "next/server";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { AddWorkOrderItemUseCase } from "@/core/use-cases/work-order/AddWorkOrderItemUseCase";

const workOrderRepo = new PrismaWorkOrderRepository();
const addUseCase = new AddWorkOrderItemUseCase(workOrderRepo);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const taskText = body.taskText;

    const item = await addUseCase.execute({
      workOrderId: id,
      taskText,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
