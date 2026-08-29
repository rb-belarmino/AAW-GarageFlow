import { IScheduleRepository } from "@/core/domain/repositories/IScheduleRepository";
import { MaintenanceSchedule } from "@/core/domain/entities/MaintenanceSchedule";

// In-memory fallback repository for Maintenance Schedules
export class PrismaScheduleRepository implements IScheduleRepository {
  private schedules: MaintenanceSchedule[] = [];

  async create(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    const id = schedule.id || `sched-${Date.now()}`;
    const newSchedule = new MaintenanceSchedule({
      ...schedule,
      id,
    });
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  async findById(id: string): Promise<MaintenanceSchedule | null> {
    const found = this.schedules.find((s) => s.id === id);
    return found ? new MaintenanceSchedule(found) : null;
  }

  async findByVehicleId(vehicleId: string): Promise<MaintenanceSchedule[]> {
    return this.schedules
      .filter((s) => s.vehicleId === vehicleId)
      .map((s) => new MaintenanceSchedule(s));
  }

  async listActive(): Promise<MaintenanceSchedule[]> {
    return this.schedules
      .filter((s) => s.isActive)
      .map((s) => new MaintenanceSchedule(s));
  }

  async update(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    const index = this.schedules.findIndex((s) => s.id === schedule.id);
    if (index >= 0) {
      this.schedules[index] = new MaintenanceSchedule(schedule);
    }
    return schedule;
  }

  async delete(id: string): Promise<void> {
    this.schedules = this.schedules.filter((s) => s.id !== id);
  }
}
