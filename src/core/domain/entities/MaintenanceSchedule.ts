export type ScheduleRecurrenceType = "TIME_BASED" | "MILEAGE_BASED" | "BOTH";

export interface MaintenanceScheduleProps {
  id?: string;
  vehicleId: string;
  serviceName: string;
  defaultToDoText: string;
  recurrenceType?: ScheduleRecurrenceType;
  intervalMonths?: number | null;
  intervalMiles?: number | null;
  lastServicedDate?: Date | null;
  lastServicedMileage?: number | null;
  nextDueDate?: Date | null;
  nextDueMileage?: number | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MaintenanceSchedule {
  public readonly id: string;
  public readonly vehicleId: string;
  public serviceName: string;
  public defaultToDoText: string;
  public recurrenceType: ScheduleRecurrenceType;
  public intervalMonths?: number | null;
  public intervalMiles?: number | null;
  public lastServicedDate?: Date | null;
  public lastServicedMileage?: number | null;
  public nextDueDate?: Date | null;
  public nextDueMileage?: number | null;
  public isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: MaintenanceScheduleProps) {
    if (!props.vehicleId || props.vehicleId.trim().length === 0) {
      throw new Error("Vehicle ID is required for a Maintenance Schedule.");
    }
    if (!props.serviceName || props.serviceName.trim().length === 0) {
      throw new Error("Service Name is required.");
    }
    if (!props.defaultToDoText || props.defaultToDoText.trim().length === 0) {
      throw new Error("Default To Do text is required.");
    }

    this.id = props.id || "";
    this.vehicleId = props.vehicleId;
    this.serviceName = props.serviceName.trim();
    this.defaultToDoText = props.defaultToDoText.trim();
    this.recurrenceType = props.recurrenceType || "BOTH";
    this.intervalMonths = props.intervalMonths ?? null;
    this.intervalMiles = props.intervalMiles ?? null;
    this.lastServicedDate = props.lastServicedDate || null;
    this.lastServicedMileage = props.lastServicedMileage ?? null;
    this.nextDueDate = props.nextDueDate || null;
    this.nextDueMileage = props.nextDueMileage ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public isDue(currentDate: Date, currentVehicleMileage: number): boolean {
    if (!this.isActive) return false;

    const isDateDue =
      this.nextDueDate !== null &&
      this.nextDueDate !== undefined &&
      currentDate >= this.nextDueDate;

    const isMileageDue =
      this.nextDueMileage !== null &&
      this.nextDueMileage !== undefined &&
      currentVehicleMileage >= this.nextDueMileage;

    if (this.recurrenceType === "TIME_BASED") return isDateDue;
    if (this.recurrenceType === "MILEAGE_BASED") return isMileageDue;
    return isDateDue || isMileageDue;
  }

  public calculateNextThresholds(completionDate: Date, completionMileage: number): void {
    this.lastServicedDate = completionDate;
    this.lastServicedMileage = completionMileage;

    if (this.intervalMonths && this.intervalMonths > 0) {
      const next = new Date(completionDate);
      next.setMonth(next.getMonth() + this.intervalMonths);
      this.nextDueDate = next;
    }

    if (this.intervalMiles && this.intervalMiles > 0) {
      this.nextDueMileage = completionMileage + this.intervalMiles;
    }
  }
}
