import { IScheduleRepository } from "@/core/domain/repositories/IScheduleRepository";
import { MaintenanceSchedule, ScheduleRecurrenceType } from "@/core/domain/entities/MaintenanceSchedule";
import { prisma } from "../prisma";

export class PrismaScheduleRepository implements IScheduleRepository {
  async create(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    const created = await prisma.maintenanceSchedule.create({
      data: {
        id: schedule.id || undefined,
        vehicleId: schedule.vehicleId,
        serviceName: schedule.serviceName,
        defaultToDoText: schedule.defaultToDoText,
        recurrenceType: schedule.recurrenceType as any,
        intervalMonths: schedule.intervalMonths,
        intervalMiles: schedule.intervalMiles,
        lastServicedDate: schedule.lastServicedDate,
        lastServicedMileage: schedule.lastServicedMileage,
        nextDueDate: schedule.nextDueDate,
        nextDueMileage: schedule.nextDueMileage,
        isActive: schedule.isActive,
      },
    });

    return new MaintenanceSchedule(created as any);
  }

  async findById(id: string): Promise<MaintenanceSchedule | null> {
    const found = await prisma.maintenanceSchedule.findUnique({
      where: { id },
    });
    return found ? new MaintenanceSchedule(found as any) : null;
  }

  async findByVehicleId(vehicleId: string): Promise<MaintenanceSchedule[]> {
    const records = await prisma.maintenanceSchedule.findMany({
      where: { vehicleId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => new MaintenanceSchedule(r as any));
  }

  async listActive(): Promise<MaintenanceSchedule[]> {
    const records = await prisma.maintenanceSchedule.findMany({
      where: { isActive: true },
      include: { vehicle: true },
    });
    return records.map((r) => new MaintenanceSchedule(r as any));
  }

  async update(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    const updated = await prisma.maintenanceSchedule.update({
      where: { id: schedule.id },
      data: {
        serviceName: schedule.serviceName,
        defaultToDoText: schedule.defaultToDoText,
        recurrenceType: schedule.recurrenceType as any,
        intervalMonths: schedule.intervalMonths,
        intervalMiles: schedule.intervalMiles,
        lastServicedDate: schedule.lastServicedDate,
        lastServicedMileage: schedule.lastServicedMileage,
        nextDueDate: schedule.nextDueDate,
        nextDueMileage: schedule.nextDueMileage,
        isActive: schedule.isActive,
      },
    });

    return new MaintenanceSchedule(updated as any);
  }

  async delete(id: string): Promise<void> {
    await prisma.maintenanceSchedule.delete({ where: { id } });
  }
}
