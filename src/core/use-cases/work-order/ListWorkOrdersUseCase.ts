import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrder, WorkOrderStatusType } from "@/core/domain/entities/WorkOrder";

export interface ListWorkOrdersDTO {
  vehicleId?: string;
  status?: WorkOrderStatusType;
  isDone?: boolean;
  search?: string;
}

export class ListWorkOrdersUseCase {
  constructor(private workOrderRepository: IWorkOrderRepository) {}

  async execute(dto?: ListWorkOrdersDTO): Promise<WorkOrder[]> {
    return await this.workOrderRepository.list(dto);
  }
}
