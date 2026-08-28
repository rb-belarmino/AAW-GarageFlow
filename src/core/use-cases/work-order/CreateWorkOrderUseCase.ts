import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { WorkOrder, WorkOrderItem } from "@/core/domain/entities/WorkOrder";

export interface CreateWorkOrderDTO {
  vehicleId: string;
  tasks?: string[] | string; // Can accept an array of tasks or multi-line text
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

    let taskList: string[] = [];
    if (Array.isArray(dto.tasks)) {
      taskList = dto.tasks.filter((t) => t && t.trim().length > 0);
    } else if (typeof dto.tasks === "string") {
      // Split by newline or slashes/dashes if provided as block text
      taskList = dto.tasks
        .split(/\n|(?:\s*\/\s*(?=[A-Z|a-z]))|(?:\s*-\s*(?=[A-Z|a-z]))/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    if (taskList.length === 0) {
      taskList = ["General Intake Inspection"];
    }

    const count = await this.workOrderRepository.count();
    const orderNumber = `WO-${1000 + count + 1}`;

    const items = taskList.map((taskText, idx) => ({
      taskText,
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

    return await this.workOrderRepository.create(workOrder);
  }
}
