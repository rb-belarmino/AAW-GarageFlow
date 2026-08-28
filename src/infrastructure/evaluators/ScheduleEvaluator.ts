import { MaintenanceSchedule } from "@/core/domain/entities/MaintenanceSchedule";
import { Vehicle } from "@/core/domain/entities/Vehicle";

export interface ScheduleEvaluationResult {
  schedule: MaintenanceSchedule;
  vehicle: Vehicle;
  isDue: boolean;
  reason?: "DATE_THRESHOLD" | "MILEAGE_THRESHOLD" | "BOTH";
}

export class ScheduleEvaluator {
  static evaluate(schedule: MaintenanceSchedule, vehicle: Vehicle, currentDate: Date = new Date()): ScheduleEvaluationResult {
    if (!schedule.isActive) {
      return { schedule, vehicle, isDue: false };
    }

    const isDateDue =
      schedule.nextDueDate !== null &&
      schedule.nextDueDate !== undefined &&
      currentDate >= schedule.nextDueDate;

    const isMileageDue =
      schedule.nextDueMileage !== null &&
      schedule.nextDueMileage !== undefined &&
      vehicle.currentMileage >= schedule.nextDueMileage;

    let isDue = false;
    let reason: "DATE_THRESHOLD" | "MILEAGE_THRESHOLD" | "BOTH" | undefined;

    if (schedule.recurrenceType === "TIME_BASED") {
      isDue = isDateDue;
      if (isDue) reason = "DATE_THRESHOLD";
    } else if (schedule.recurrenceType === "MILEAGE_BASED") {
      isDue = isMileageDue;
      if (isDue) reason = "MILEAGE_THRESHOLD";
    } else {
      isDue = isDateDue || isMileageDue;
      if (isDateDue && isMileageDue) reason = "BOTH";
      else if (isDateDue) reason = "DATE_THRESHOLD";
      else if (isMileageDue) reason = "MILEAGE_THRESHOLD";
    }

    return {
      schedule,
      vehicle,
      isDue,
      reason,
    };
  }
}
