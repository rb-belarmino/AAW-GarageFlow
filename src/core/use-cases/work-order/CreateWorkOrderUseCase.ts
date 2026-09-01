import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { WorkOrder, WorkOrderItem } from "@/core/domain/entities/WorkOrder";

export interface CreateTaskItemDTO {
  taskText: string;
  notes?: string | null;
}

export interface CreateWorkOrderDTO {
  vehicleId: string;
  tasks?: Array<string | CreateTaskItemDTO> | string; // Can accept array of strings, objects or multi-line text
  notes?: string | null;
}

export class CreateWorkOrderUseCase {
  constructor(
    private workOrderRepository: IWorkOrderRepository,
    private vehicleRepository: IVehicleRepository
  ) {}

  async execute(dto: CreateWorkOrderDTO): Promise<WorkOrder> {
    const vehicle = await this.vehicleRepository.findById(dto.vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${dto.vehicleId} was not found.`);
    }

    let itemsInput: CreateTaskItemDTO[] = [];

    if (Array.isArray(dto.tasks)) {
      for (const t of dto.tasks) {
        if (typeof t === "string" && t.trim().length > 0) {
          itemsInput.push({ taskText: t.trim(), notes: null });
        } else if (t && typeof t === "object" && typeof t.taskText === "string" && t.taskText.trim().length > 0) {
          itemsInput.push({ taskText: t.taskText.trim(), notes: t.notes?.trim() || null });
        }
      }
    } else if (typeof dto.tasks === "string") {
      // Split by newline or slashes/dashes if provided as block text
      const splits = dto.tasks
        .split(/\n|(?:\s*\/\s*(?=[A-Z|a-z]))|(?:\s*-\s*(?=[A-Z|a-z]))/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      for (const t of splits) {
        itemsInput.push({ taskText: t, notes: null });
      }
    }


    if (itemsInput.length === 0) {
      itemsInput = [{ taskText: "General Intake Inspection", notes: null }];
    }

    // Collision-proof orderNumber calculation
    const totalCount = await this.workOrderRepository.count();
    let nextNum = 1000 + totalCount + 1;
    let candidate = `WO-${nextNum}`;

    while (await this.workOrderRepository.findByOrderNumber(candidate)) {
      nextNum++;
      candidate = `WO-${nextNum}`;
    }
    const orderNumber = candidate;

    const items = itemsInput.map((item, idx) => ({
      taskText: item.taskText,
      notes: item.notes || null,
      orderIndex: idx,
      isCompleted: false,
    }));

    const workOrder = new WorkOrder({
      orderNumber,
      vehicleId: dto.vehicleId,
      notes: dto.notes,
      items,
      isDone: false,

      status: "IN_PROGRESS",
    });

    try {
      return await this.workOrderRepository.create(workOrder);
    } catch (err: any) {
      // In case of rapid concurrent creations, retry with next available suffix
      if (err?.message?.includes("orderNumber") || err?.code === "P2002") {
        let retryNum = nextNum + 1;
        let retryCandidate = `WO-${retryNum}`;
        while (await this.workOrderRepository.findByOrderNumber(retryCandidate)) {
          retryNum++;
          retryCandidate = `WO-${retryNum}`;
        }
        const retryOrder = new WorkOrder({
          ...workOrder,
          orderNumber: retryCandidate,
        });
        return await this.workOrderRepository.create(retryOrder);
      }
      throw err;
    }
  }
}
