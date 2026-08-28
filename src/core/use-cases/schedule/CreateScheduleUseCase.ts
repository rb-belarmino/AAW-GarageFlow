import { IScheduleRepository } from "@/core/domain/repositories/IScheduleRepository";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { MaintenanceSchedule, ScheduleRecurrenceType } from "@/core/domain/entities/MaintenanceSchedule";

export interface CreateScheduleDTO {
  vehicleId: string;
  serviceName: string;
  defaultToDoText: string;
  recurrenceType?: ScheduleRecurrenceType;
  intervalMonths?: number | null;
  intervalMiles?: number | null;
  lastServicedDate?: Date | null;
  lastServicedMileage?: number | null;
}

export class CreateScheduleUseCase {
  constructor(
    private scheduleRepository: IScheduleRepository,
    private vehicleRepository: IVehicleRepository
  ) {}

  async execute(dto: CreateScheduleDTO): Promise<MaintenanceSchedule> {
    const vehicle = await this.vehicleRepository.findById(dto.vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${dto.vehicleId} was not found.`);
    }

    const schedule = new MaintenanceSchedule({
      vehicleId: dto.vehicleId,
      serviceName: dto.serviceName,
      defaultToDoText: dto.defaultToDoText,
      recurrenceType: dto.recurrenceType || "BOTH",
      intervalMonths: dto.intervalMonths,
      intervalMiles: dto.intervalMiles,
      lastServicedDate: dto.lastServicedDate || new Date(),
      lastServicedMileage: dto.lastServicedMileage ?? vehicle.currentMileage,
    });

    schedule.calculateNextThresholds(
      schedule.lastServicedDate || new Date(),
      schedule.lastServicedMileage ?? vehicle.currentMileage
    );

    return await this.scheduleRepository.create(schedule);
  }
}
