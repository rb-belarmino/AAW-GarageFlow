import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrderItem } from "@/core/domain/entities/WorkOrder";

export interface UpdateWorkOrderItemDTO {
  itemId: string;
  taskText?: string;
  notes?: string | null;
}

export class UpdateWorkOrderItemUseCase {
  constructor(private workOrderRepository: IWorkOrderRepository) {}

  async execute(dto: UpdateWorkOrderItemDTO): Promise<WorkOrderItem> {
    if (!dto.itemId) {
      throw new Error("Item ID is required.");
    }
    return await this.workOrderRepository.updateItem(dto.itemId, {
      taskText: dto.taskText,
      notes: dto.notes,
    });
  }
}
