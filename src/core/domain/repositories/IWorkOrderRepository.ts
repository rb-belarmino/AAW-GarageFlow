import { WorkOrder, WorkOrderStatusType } from "../entities/WorkOrder";

export interface IWorkOrderRepository {
  create(workOrder: WorkOrder): Promise<WorkOrder>;
  findById(id: string): Promise<WorkOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<WorkOrder | null>;
  list(filter?: {
    vehicleId?: string;
    status?: WorkOrderStatusType;
    isDone?: boolean;
    search?: string;
  }): Promise<WorkOrder[]>;
  update(workOrder: WorkOrder): Promise<WorkOrder>;
  delete(id: string): Promise<void>;
  count(filter?: { isDone?: boolean; status?: WorkOrderStatusType }): Promise<number>;
}
