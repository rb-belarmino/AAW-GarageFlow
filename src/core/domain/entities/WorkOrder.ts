export type WorkOrderStatusType = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface WorkOrderItemProps {
  id?: string;
  workOrderId?: string;
  taskText: string;
  notes?: string | null;
  isCompleted?: boolean;
  completedAt?: Date | null;
  completedBy?: string | null;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WorkOrderItem {
  public readonly id: string;
  public readonly workOrderId: string;
  public taskText: string;
  public notes?: string | null;
  public isCompleted: boolean;
  public completedAt?: Date | null;
  public completedBy?: string | null;
  public orderIndex: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WorkOrderItemProps) {
    if (!props.taskText || props.taskText.trim().length === 0) {
      throw new Error("Task item description cannot be empty.");
    }
    this.id = props.id || "";
    this.workOrderId = props.workOrderId || "";
    this.taskText = props.taskText.trim();
    this.notes = props.notes ? props.notes.trim() : null;
    this.isCompleted = props.isCompleted ?? false;
    this.completedAt = props.completedAt || (this.isCompleted ? new Date() : null);
    this.completedBy = props.completedBy || null;
    this.orderIndex = props.orderIndex ?? 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }


  public toggle(completed: boolean, completedBy?: string | null): void {
    this.isCompleted = completed;
    this.completedAt = completed ? new Date() : null;
    if (completedBy) this.completedBy = completedBy;
  }
}

export interface WorkOrderProps {
  id?: string;
  orderNumber?: string;
  vehicleId: string;
  status?: WorkOrderStatusType;
  isDone?: boolean;
  completedAt?: Date | null;
  completedBy?: string | null;
  notes?: string | null;
  items?: WorkOrderItemProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class WorkOrder {
  public readonly id: string;
  public readonly orderNumber: string;
  public readonly vehicleId: string;
  public status: WorkOrderStatusType;
  public isDone: boolean;
  public completedAt?: Date | null;
  public completedBy?: string | null;
  public notes?: string | null;
  public items: WorkOrderItem[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WorkOrderProps) {
    if (!props.vehicleId || props.vehicleId.trim().length === 0) {
      throw new Error("Vehicle ID is required for a Work Order.");
    }

    this.id = props.id || "";
    this.orderNumber = props.orderNumber || `WO-${Math.floor(1000 + Math.random() * 9000)}`;
    this.vehicleId = props.vehicleId;
    this.items = (props.items || []).map((it, idx) => new WorkOrderItem({ ...it, orderIndex: it.orderIndex ?? idx }));
    this.isDone = props.isDone ?? (this.items.length > 0 && this.items.every((i) => i.isCompleted));
    this.status = props.status || (this.isDone ? "DONE" : "IN_PROGRESS");
    this.completedAt = props.completedAt || (this.isDone ? new Date() : null);
    this.completedBy = props.completedBy?.trim() || null;
    this.notes = props.notes?.trim() || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public toggleItem(itemId: string, completed: boolean, completedBy?: string | null): void {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) throw new Error(`Item ${itemId} not found in work order`);
    item.toggle(completed, completedBy);

    // Auto-update overall work order status based on all items completion
    this.checkOverallStatus();
  }

  public toggleAll(isDone: boolean, completedBy?: string | null): void {
    this.isDone = isDone;
    this.status = isDone ? "DONE" : "IN_PROGRESS";
    this.completedAt = isDone ? new Date() : null;
    if (completedBy) this.completedBy = completedBy;

    for (const it of this.items) {
      it.toggle(isDone, completedBy);
    }
  }

  public addItem(taskText: string, notes?: string | null): void {
    this.items.push(new WorkOrderItem({
      taskText,
      notes,
      workOrderId: this.id,
      orderIndex: this.items.length,
      isCompleted: false,
    }));
    this.checkOverallStatus();
  }


  public checkOverallStatus(): void {
    if (this.items.length > 0 && this.items.every((i) => i.isCompleted)) {
      this.isDone = true;
      this.status = "DONE";
      this.completedAt = new Date();
    } else {
      this.isDone = false;
      this.status = "IN_PROGRESS";
      this.completedAt = null;
    }
  }

  public get completedItemsCount(): number {
    return this.items.filter((i) => i.isCompleted).length;
  }

  public get totalItemsCount(): number {
    return this.items.length;
  }
}
