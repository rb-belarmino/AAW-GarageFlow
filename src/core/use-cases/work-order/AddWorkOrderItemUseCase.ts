import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrderItem } from "@/core/domain/entities/WorkOrder";

export interface AddWorkOrderItemDTO {
  workOrderId: string;
  taskText: string;
}

export class AddWorkOrderItemUseCase {
  constructor(private workOrderRepository: IWorkOrderRepository) {}

  async execute(dto: AddWorkOrderItemDTO): Promise<WorkOrderItem> {
    if (!dto.taskText || dto.taskText.trim().length === 0) {
      throw new Error("Task item text cannot be empty.");
    }
    return await this.workOrderRepository.addItem(dto.workOrderId, dto.taskText.trim());
  }
}
