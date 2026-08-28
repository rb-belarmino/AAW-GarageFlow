import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";

export interface DashboardMetricsDTO {
  totalVehicles: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  ratioDoneText: string; // e.g. "9/0 Done"
  recentWorkOrders: Array<{
    id: string;
    orderNumber: string;
    vehicleName: string;
    vin: string;
    toDoText: string;
    isDone: boolean;
    status: string;
    completedItems: number;
    totalItems: number;
    createdAt: Date;
  }>;
}

export class GetDashboardMetricsUseCase {
  constructor(
    private vehicleRepository: IVehicleRepository,
    private workOrderRepository: IWorkOrderRepository
  ) {}

  async execute(): Promise<DashboardMetricsDTO> {
    const totalVehicles = await this.vehicleRepository.count({ status: "ACTIVE" });
    const completedWorkOrders = await this.workOrderRepository.count({ isDone: true });
    const activeWorkOrders = await this.workOrderRepository.count({ isDone: false });
    const allWorkOrders = await this.workOrderRepository.list();
    const allVehicles = await this.vehicleRepository.list();

    const vehicleMap = new Map(allVehicles.map((v) => [v.id, v]));

    const recentWorkOrders = allWorkOrders.slice(0, 15).map((wo) => {
      const veh = vehicleMap.get(wo.vehicleId);
      const vehicleName = veh ? `${veh.year} ${veh.make} ${veh.model}` : "Unknown Vehicle";
      const vin = veh ? veh.vin : "N/A";
      const taskSummary = wo.items.map((i) => (i.isCompleted ? `[✓] ${i.taskText}` : `[ ] ${i.taskText}`)).join(" • ");

      return {
        id: wo.id,
        orderNumber: wo.orderNumber,
        vehicleName,
        vin,
        toDoText: taskSummary || "No tasks listed",
        isDone: wo.isDone,
        status: wo.status,
        completedItems: wo.completedItemsCount,
        totalItems: wo.totalItemsCount,
        createdAt: wo.createdAt,
      };
    });

    const ratioDoneText = `${completedWorkOrders}/${activeWorkOrders} Done`;

    return {
      totalVehicles,
      activeWorkOrders,
      completedWorkOrders,
      ratioDoneText,
      recentWorkOrders,
    };
  }
}
