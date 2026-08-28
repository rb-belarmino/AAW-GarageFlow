import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrder } from "@/core/domain/entities/WorkOrder";

export interface ToggleWorkOrderItemDTO {
  itemId: string;
  isCompleted: boolean;
  completedBy?: string | null;
}

export class ToggleWorkOrderItemUseCase {
  constructor(private workOrderRepository: IWorkOrderRepository) {}

  async execute(dto: ToggleWorkOrderItemDTO): Promise<WorkOrder> {
    return await this.workOrderRepository.toggleItem(
      dto.itemId,
      dto.isCompleted,
      dto.completedBy
    );
  }
}
