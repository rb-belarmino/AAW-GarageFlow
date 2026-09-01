import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { WorkOrder, WorkOrderItemProps, WorkOrderStatusType } from "@/core/domain/entities/WorkOrder";

export interface UpdateWorkOrderDTO {
  id: string;
  vehicleId?: string;
  status?: WorkOrderStatusType;
  isDone?: boolean;
  notes?: string | null;
  completedBy?: string | null;
  items?: Array<{
    id?: string;
    taskText: string;
    notes?: string | null;
    isCompleted?: boolean;
    orderIndex?: number;
  }>;
}

export class UpdateWorkOrderUseCase {
  constructor(
    private workOrderRepository: IWorkOrderRepository,
    private vehicleRepository: IVehicleRepository
  ) {}

  async execute(dto: UpdateWorkOrderDTO): Promise<WorkOrder> {
    if (!dto.id) {
      throw new Error("Work Order ID is required for update.");
    }

    const existing = await this.workOrderRepository.findById(dto.id);
    if (!existing) {
      throw new Error(`Work Order with ID ${dto.id} not found.`);
    }

    const targetVehicleId = dto.vehicleId || existing.vehicleId;
    if (dto.vehicleId && dto.vehicleId !== existing.vehicleId) {
      const vehicle = await this.vehicleRepository.findById(dto.vehicleId);
      if (!vehicle) {
        throw new Error(`Vehicle with ID ${dto.vehicleId} does not exist.`);
      }
    }

    let updatedItems: WorkOrderItemProps[] | undefined = undefined;
    if (dto.items) {
      if (dto.items.length === 0) {
        throw new Error("A Work Order must have at least one task.");
      }
      updatedItems = dto.items.map((it, idx) => ({
        id: it.id,
        workOrderId: existing.id,
        taskText: it.taskText,
        notes: it.notes !== undefined ? (it.notes ? it.notes.trim() : null) : null,
        isCompleted: it.isCompleted ?? false,
        orderIndex: it.orderIndex ?? idx,
      }));
    }

    const allItems = updatedItems || existing.items.map((i) => ({
      id: i.id,
      workOrderId: i.workOrderId,
      taskText: i.taskText,
      notes: i.notes,
      isCompleted: i.isCompleted,
      orderIndex: i.orderIndex,
    }));


    const allDone = allItems.length > 0 && allItems.every((i) => i.isCompleted);
    const isDone = dto.isDone !== undefined ? dto.isDone : allDone;
    const status = dto.status || (isDone ? "DONE" : "IN_PROGRESS");

    const updatedWorkOrder = new WorkOrder({
      id: existing.id,
      orderNumber: existing.orderNumber,
      vehicleId: targetVehicleId,
      status,
      isDone,
      completedAt: isDone ? (existing.completedAt || new Date()) : null,
      completedBy: dto.completedBy !== undefined ? dto.completedBy : existing.completedBy,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
      items: allItems,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return await this.workOrderRepository.update(updatedWorkOrder);
  }
}
