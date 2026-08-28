import { Vehicle } from "@/core/domain/entities/Vehicle";
import { WorkOrder, WorkOrderItem } from "@/core/domain/entities/WorkOrder";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";

export class InMemoryVehicleRepository implements IVehicleRepository {
  public vehicles: Map<string, Vehicle> = new Map();

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const id = vehicle.id || `veh-${this.vehicles.size + 1}`;
    const saved = new Vehicle({ ...vehicle, id });
    this.vehicles.set(id, saved);
    return saved;
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehicles.get(id) || null;
  }

  async findByVin(vin: string): Promise<Vehicle | null> {
    for (const v of this.vehicles.values()) {
      if (v.vin === vin.toUpperCase()) return v;
    }
    return null;
  }

  async list(filter?: { status?: string; search?: string; sourceTag?: string }): Promise<Vehicle[]> {
    let result = Array.from(this.vehicles.values());
    if (filter?.status) result = result.filter((v) => v.status === filter.status);
    if (filter?.sourceTag) result = result.filter((v) => v.sourceTag === filter.sourceTag);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (v) =>
          v.vin.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  async delete(id: string): Promise<void> {
    this.vehicles.delete(id);
  }

  async count(filter?: { status?: string }): Promise<number> {
    let list = Array.from(this.vehicles.values());
    if (filter?.status) list = list.filter((v) => v.status === filter.status);
    return list.length;
  }
}

export class InMemoryWorkOrderRepository implements IWorkOrderRepository {
  public workOrders: Map<string, WorkOrder> = new Map();
  public itemsMap: Map<string, WorkOrderItem> = new Map();

  async create(workOrder: WorkOrder): Promise<WorkOrder> {
    const id = workOrder.id || `wo-${this.workOrders.size + 1}`;
    const items = workOrder.items.map((it, idx) => {
      const itemId = it.id || `item-${this.itemsMap.size + idx + 1}`;
      const item = new WorkOrderItem({ ...it, id: itemId, workOrderId: id });
      this.itemsMap.set(itemId, item);
      return item;
    });

    const saved = new WorkOrder({ ...workOrder, id, items });
    this.workOrders.set(id, saved);
    return saved;
  }

  async findById(id: string): Promise<WorkOrder | null> {
    return this.workOrders.get(id) || null;
  }

  async findByOrderNumber(orderNumber: string): Promise<WorkOrder | null> {
    for (const wo of this.workOrders.values()) {
      if (wo.orderNumber === orderNumber) return wo;
    }
    return null;
  }

  async list(filter?: {
    vehicleId?: string;
    status?: any;
    isDone?: boolean;
    search?: string;
  }): Promise<WorkOrder[]> {
    let result = Array.from(this.workOrders.values());
    if (filter?.vehicleId) result = result.filter((w) => w.vehicleId === filter.vehicleId);
    if (filter?.status) result = result.filter((w) => w.status === filter.status);
    if (filter?.isDone !== undefined) result = result.filter((w) => w.isDone === filter.isDone);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (w) =>
          w.orderNumber.toLowerCase().includes(q) ||
          w.items.some((i) => i.taskText.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async update(workOrder: WorkOrder): Promise<WorkOrder> {
    this.workOrders.set(workOrder.id, workOrder);
    return workOrder;
  }

  async toggleItem(itemId: string, isCompleted: boolean, completedBy?: string | null): Promise<WorkOrder> {
    const item = this.itemsMap.get(itemId);
    if (!item) throw new Error(`Item ${itemId} not found in harness`);
    item.toggle(isCompleted, completedBy);

    const wo = this.workOrders.get(item.workOrderId);
    if (!wo) throw new Error("Work order not found");
    
    wo.toggleItem(itemId, isCompleted, completedBy);
    return wo;
  }

  async addItem(workOrderId: string, taskText: string): Promise<WorkOrderItem> {
    const wo = this.workOrders.get(workOrderId);
    if (!wo) throw new Error("Work order not found");
    const itemId = `item-${this.itemsMap.size + 1}`;
    const item = new WorkOrderItem({ id: itemId, workOrderId, taskText, isCompleted: false });
    this.itemsMap.set(itemId, item);
    wo.items.push(item);
    wo.checkOverallStatus();
    return item;
  }

  async removeItem(itemId: string): Promise<void> {
    const item = this.itemsMap.get(itemId);
    if (item) {
      this.itemsMap.delete(itemId);
      const wo = this.workOrders.get(item.workOrderId);
      if (wo) {
        wo.items = wo.items.filter((i) => i.id !== itemId);
        wo.checkOverallStatus();
      }
    }
  }

  async delete(id: string): Promise<void> {
    this.workOrders.delete(id);
  }

  async count(filter?: { isDone?: boolean; status?: any }): Promise<number> {
    let list = Array.from(this.workOrders.values());
    if (filter?.isDone !== undefined) list = list.filter((w) => w.isDone === filter.isDone);
    if (filter?.status) list = list.filter((w) => w.status === filter.status);
    return list.length;
  }
}

describe("AAW GarageFlow Evaluation Test Harness - Baseline", () => {
  it("should initialize in-memory evaluation harness with multi-task support", () => {
    const vehicleRepo = new InMemoryVehicleRepository();
    const workOrderRepo = new InMemoryWorkOrderRepository();

    expect(vehicleRepo).toBeDefined();
    expect(workOrderRepo).toBeDefined();
  });
});
