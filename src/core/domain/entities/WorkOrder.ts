export type WorkOrderStatusType = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface WorkOrderProps {
  id?: string;
  orderNumber?: string;
  vehicleId: string;
  toDoText: string;
  isDone?: boolean;
  status?: WorkOrderStatusType;
  scheduledDate?: Date | null;
  completedAt?: Date | null;
  completedBy?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WorkOrder {
  public readonly id: string;
  public readonly orderNumber: string;
  public readonly vehicleId: string;
  public toDoText: string;
  public isDone: boolean;
  public status: WorkOrderStatusType;
  public scheduledDate?: Date | null;
  public completedAt?: Date | null;
  public completedBy?: string | null;
  public notes?: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WorkOrderProps) {
    if (!props.vehicleId || props.vehicleId.trim().length === 0) {
      throw new Error("Vehicle ID is required for a Work Order.");
    }
    if (!props.toDoText || props.toDoText.trim().length === 0) {
      throw new Error("To Do text cannot be empty.");
    }

    this.id = props.id || "";
    this.orderNumber = props.orderNumber || `WO-${Math.floor(1000 + Math.random() * 9000)}`;
    this.vehicleId = props.vehicleId;
    this.toDoText = props.toDoText.trim();
    this.isDone = props.isDone ?? false;
    this.status = props.status || (this.isDone ? "DONE" : "IN_PROGRESS");
    this.scheduledDate = props.scheduledDate || null;
    this.completedAt = props.completedAt || (this.isDone ? new Date() : null);
    this.completedBy = props.completedBy?.trim() || null;
    this.notes = props.notes?.trim() || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public toggleDone(isDone: boolean, completedBy?: string | null): void {
    this.isDone = isDone;
    if (isDone) {
      this.status = "DONE";
      this.completedAt = new Date();
      if (completedBy) this.completedBy = completedBy.trim();
    } else {
      this.status = "IN_PROGRESS";
      this.completedAt = null;
    }
  }

  public updateToDoText(newText: string): void {
    if (!newText || newText.trim().length === 0) {
      throw new Error("To Do text cannot be empty.");
    }
    this.toDoText = newText.trim();
  }
}
