import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrder } from "@/core/domain/entities/WorkOrder";

export interface ToggleWorkOrderDoneDTO {
  workOrderId: string;
  isDone: boolean;
  completedBy?: string | null;
}

export class ToggleWorkOrderDoneUseCase {
  constructor(private workOrderRepository: IWorkOrderRepository) {}

  async execute(dto: ToggleWorkOrderDoneDTO): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findById(dto.workOrderId);
    if (!workOrder) {
      throw new Error(`Work Order with ID ${dto.workOrderId} was not found.`);
    }

    workOrder.toggleDone(dto.isDone, dto.completedBy);
    return await this.workOrderRepository.update(workOrder);
  }
}
