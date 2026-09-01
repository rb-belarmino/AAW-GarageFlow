import { IScheduleRepository } from "@/core/domain/repositories/IScheduleRepository";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { WorkOrder } from "@/core/domain/entities/WorkOrder";
import { ScheduleEvaluator } from "@/infrastructure/evaluators/ScheduleEvaluator";

export interface DispatchedScheduleResult {
  scheduleId: string;
  vehicleVin: string;
  serviceName: string;
  workOrderId: string;
  orderNumber: string;
  dueReason?: string;
}

export class EvaluateRecurringSchedulesUseCase {
  constructor(
    private scheduleRepository: IScheduleRepository,
    private vehicleRepository: IVehicleRepository,
    private workOrderRepository: IWorkOrderRepository
  ) {}

  async execute(currentDate: Date = new Date()): Promise<{
    evaluatedCount: number;
    dispatchedCount: number;
    dispatchedOrders: DispatchedScheduleResult[];
  }> {
    const activeSchedules = await this.scheduleRepository.listActive();
    const dispatchedOrders: DispatchedScheduleResult[] = [];

    for (const schedule of activeSchedules) {
      const vehicle = await this.vehicleRepository.findById(schedule.vehicleId);
      if (!vehicle || vehicle.status !== "ACTIVE") continue;

      const evalResult = ScheduleEvaluator.evaluate(schedule, vehicle, currentDate);
      if (evalResult.isDue) {
        const totalCount = await this.workOrderRepository.count();
        let nextNum = 1000 + totalCount + 1;
        let candidate = `WO-${nextNum}`;

        while (await this.workOrderRepository.findByOrderNumber(candidate)) {
          nextNum++;
          candidate = `WO-${nextNum}`;
        }
        const orderNumber = candidate;

        const autoWorkOrder = new WorkOrder({
          orderNumber,
          vehicleId: vehicle.id,
          items: [
            {
              taskText: `[AUTO-DISPATCHED] ${schedule.serviceName}: ${schedule.defaultToDoText} (Triggered by ${evalResult.reason})`,
              isCompleted: false,
            },
          ],
          notes: `Generated automatically via recurring maintenance schedule (${schedule.serviceName})`,
          status: "IN_PROGRESS",
          isDone: false,
        });

        const createdOrder = await this.workOrderRepository.create(autoWorkOrder);

        dispatchedOrders.push({
          scheduleId: schedule.id,
          vehicleVin: vehicle.vin,
          serviceName: schedule.serviceName,
          workOrderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          dueReason: evalResult.reason,
        });
      }
    }

    return {
      evaluatedCount: activeSchedules.length,
      dispatchedCount: dispatchedOrders.length,
      dispatchedOrders,
    };
  }
}
