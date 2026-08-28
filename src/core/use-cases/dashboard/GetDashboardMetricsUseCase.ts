import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { IScheduleRepository } from "@/core/domain/repositories/IScheduleRepository";
import { ScheduleEvaluator } from "@/infrastructure/evaluators/ScheduleEvaluator";

export interface DashboardMetricsDTO {
  totalVehicles: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  ratioDoneText: string; // e.g. "9/0 Done"
  dueMaintenanceCount: number;
  recentWorkOrders: Array<{
    id: string;
    orderNumber: string;
    vehicleName: string;
    vin: string;
    toDoText: string;
    isDone: boolean;
    status: string;
    createdAt: Date;
  }>;
}

export class GetDashboardMetricsUseCase {
  constructor(
    private vehicleRepository: IVehicleRepository,
    private workOrderRepository: IWorkOrderRepository,
    private scheduleRepository: IScheduleRepository
  ) {}

  async execute(): Promise<DashboardMetricsDTO> {
    const totalVehicles = await this.vehicleRepository.count({ status: "ACTIVE" });
    const completedWorkOrders = await this.workOrderRepository.count({ isDone: true });
    const activeWorkOrders = await this.workOrderRepository.count({ isDone: false });
    const allWorkOrders = await this.workOrderRepository.list();
    const allVehicles = await this.vehicleRepository.list();
    const activeSchedules = await this.scheduleRepository.listActive();

    const vehicleMap = new Map(allVehicles.map((v) => [v.id, v]));

    let dueMaintenanceCount = 0;
    const now = new Date();
    for (const sch of activeSchedules) {
      const veh = vehicleMap.get(sch.vehicleId);
      if (veh && ScheduleEvaluator.evaluate(sch, veh, now).isDue) {
        dueMaintenanceCount++;
      }
    }

    const recentWorkOrders = allWorkOrders.slice(0, 15).map((wo) => {
      const veh = vehicleMap.get(wo.vehicleId);
      const vehicleName = veh ? `${veh.year} ${veh.make} ${veh.model}` : "Unknown Vehicle";
      const vin = veh ? veh.vin : "N/A";
      return {
        id: wo.id,
        orderNumber: wo.orderNumber,
        vehicleName,
        vin,
        toDoText: wo.toDoText,
        isDone: wo.isDone,
        status: wo.status,
        createdAt: wo.createdAt,
      };
    });

    const ratioDoneText = `${completedWorkOrders}/${activeWorkOrders} Done`;

    return {
      totalVehicles,
      activeWorkOrders,
      completedWorkOrders,
      ratioDoneText,
      dueMaintenanceCount,
      recentWorkOrders,
    };
  }
}
