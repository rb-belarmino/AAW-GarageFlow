import { MaintenanceSchedule } from "../entities/MaintenanceSchedule";

export interface IScheduleRepository {
  create(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule>;
  findById(id: string): Promise<MaintenanceSchedule | null>;
  findByVehicleId(vehicleId: string): Promise<MaintenanceSchedule[]>;
  listActive(): Promise<MaintenanceSchedule[]>;
  update(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule>;
  delete(id: string): Promise<void>;
}
