import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrder, WorkOrderItem, WorkOrderStatusType } from "@/core/domain/entities/WorkOrder";
import { prisma } from "../prisma";

export class PrismaWorkOrderRepository implements IWorkOrderRepository {
  async create(workOrder: WorkOrder): Promise<WorkOrder> {
    const created = await prisma.workOrder.create({
      data: {
        id: workOrder.id || undefined,
        orderNumber: workOrder.orderNumber,
        vehicleId: workOrder.vehicleId,
        isDone: workOrder.isDone,
        status: workOrder.status,
        completedAt: workOrder.completedAt,
        completedBy: workOrder.completedBy,
        notes: workOrder.notes,
        items: {
          create: workOrder.items.map((it, idx) => ({
            id: it.id || undefined,
            taskText: it.taskText,
            isCompleted: it.isCompleted,
            orderIndex: idx,
          })),
        },
      },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return new WorkOrder(created as any);
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const found = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });
    return found ? new WorkOrder(found as any) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<WorkOrder | null> {
    const found = await prisma.workOrder.findUnique({
      where: { orderNumber },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
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
        { orderNumber: { contains: filter.search, mode: "insensitive" } },
        { items: { some: { taskText: { contains: filter.search, mode: "insensitive" } } } },
      ];
    }

    const records = await prisma.workOrder.findMany({
      where,
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => new WorkOrder(r as any));
  }

  async update(workOrder: WorkOrder): Promise<WorkOrder> {
    const updated = await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        isDone: workOrder.isDone,
        status: workOrder.status,
        completedAt: workOrder.completedAt,
        completedBy: workOrder.completedBy,
        notes: workOrder.notes,
      },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return new WorkOrder(updated as any);
  }

  async toggleItem(itemId: string, isCompleted: boolean, completedBy?: string | null): Promise<WorkOrder> {
    const item = await prisma.workOrderItem.update({
      where: { id: itemId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        completedBy: completedBy || null,
      },
    });

    // Check all items of this work order
    const allItems = await prisma.workOrderItem.findMany({
      where: { workOrderId: item.workOrderId },
    });

    const allDone = allItems.length > 0 && allItems.every((i) => i.isCompleted);

    const updatedOrder = await prisma.workOrder.update({
      where: { id: item.workOrderId },
      data: {
        isDone: allDone,
        status: allDone ? "DONE" : "IN_PROGRESS",
        completedAt: allDone ? new Date() : null,
      },
      include: {
        items: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return new WorkOrder(updatedOrder as any);
  }

  async addItem(workOrderId: string, taskText: string): Promise<WorkOrderItem> {
    const count = await prisma.workOrderItem.count({ where: { workOrderId } });
    const created = await prisma.workOrderItem.create({
      data: {
        workOrderId,
        taskText,
        orderIndex: count,
        isCompleted: false,
      },
    });

    // Ensure order is updated to IN_PROGRESS if a new pending item is added
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { isDone: false, status: "IN_PROGRESS" },
    });

    return new WorkOrderItem(created as any);
  }

  async removeItem(itemId: string): Promise<void> {
    const item = await prisma.workOrderItem.findUnique({ where: { id: itemId } });
    if (item) {
      await prisma.workOrderItem.delete({ where: { id: itemId } });
      const remaining = await prisma.workOrderItem.findMany({ where: { workOrderId: item.workOrderId } });
      const allDone = remaining.length > 0 && remaining.every((i) => i.isCompleted);
      await prisma.workOrder.update({
        where: { id: item.workOrderId },
        data: { isDone: allDone, status: allDone ? "DONE" : "IN_PROGRESS" },
      });
    }
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
