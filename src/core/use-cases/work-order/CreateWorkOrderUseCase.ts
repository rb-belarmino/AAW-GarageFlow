import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { WorkOrder } from "@/core/domain/entities/WorkOrder";

export interface CreateWorkOrderDTO {
  vehicleId: string;
  toDoText: string;
  notes?: string | null;
  scheduledDate?: Date | null;
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

    const count = await this.workOrderRepository.count();
    const orderNumber = `WO-${1000 + count + 1}`;

    const workOrder = new WorkOrder({
      orderNumber,
      vehicleId: dto.vehicleId,
      toDoText: dto.toDoText,
      notes: dto.notes,
      scheduledDate: dto.scheduledDate,
      isDone: false,
      status: "IN_PROGRESS",
    });

    return await this.workOrderRepository.create(workOrder);
  }
}
