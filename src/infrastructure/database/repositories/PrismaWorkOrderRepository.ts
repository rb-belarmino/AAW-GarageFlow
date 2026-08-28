import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrder, WorkOrderStatusType } from "@/core/domain/entities/WorkOrder";
import { prisma } from "../prisma";

export class PrismaWorkOrderRepository implements IWorkOrderRepository {
  async create(workOrder: WorkOrder): Promise<WorkOrder> {
    const created = await prisma.workOrder.create({
      data: {
        id: workOrder.id || undefined,
        orderNumber: workOrder.orderNumber,
        vehicleId: workOrder.vehicleId,
        toDoText: workOrder.toDoText,
        isDone: workOrder.isDone,
        status: workOrder.status,
        scheduledDate: workOrder.scheduledDate,
        completedAt: workOrder.completedAt,
        completedBy: workOrder.completedBy,
        notes: workOrder.notes,
      },
    });

    return new WorkOrder(created as any);
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const found = await prisma.workOrder.findUnique({
      where: { id },
    });
    return found ? new WorkOrder(found as any) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<WorkOrder | null> {
    const found = await prisma.workOrder.findUnique({
      where: { orderNumber },
    });
    return found ? new WorkOrder(found as any) : null;
  }

  async list(filter?: {
    vehicleId?: string;
    status?: WorkOrderStatusType;
    isDone?: boolean;
    search?: string;
  }): Promise<WorkOrder[]> {
    const where: any = {};
    if (filter?.vehicleId) where.vehicleId = filter.vehicleId;
    if (filter?.status) where.status = filter.status;
    if (filter?.isDone !== undefined) where.isDone = filter.isDone;
    if (filter?.search) {
      where.OR = [
        { toDoText: { contains: filter.search, mode: "insensitive" } },
        { orderNumber: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const records = await prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => new WorkOrder(r as any));
  }

  async update(workOrder: WorkOrder): Promise<WorkOrder> {
    const updated = await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        toDoText: workOrder.toDoText,
        isDone: workOrder.isDone,
        status: workOrder.status,
        scheduledDate: workOrder.scheduledDate,
        completedAt: workOrder.completedAt,
        completedBy: workOrder.completedBy,
        notes: workOrder.notes,
      },
    });

    return new WorkOrder(updated as any);
  }

  async delete(id: string): Promise<void> {
    await prisma.workOrder.delete({ where: { id } });
  }

  async count(filter?: { isDone?: boolean; status?: WorkOrderStatusType }): Promise<number> {
    const where: any = {};
    if (filter?.isDone !== undefined) where.isDone = filter.isDone;
    if (filter?.status) where.status = filter.status;

    return prisma.workOrder.count({ where });
  }
}
