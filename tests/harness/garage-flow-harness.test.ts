import { Vehicle } from "@/core/domain/entities/Vehicle";
import { WorkOrder } from "@/core/domain/entities/WorkOrder";
import { MaintenanceSchedule } from "@/core/domain/entities/MaintenanceSchedule";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { IWorkOrderRepository } from "@/core/domain/repositories/IWorkOrderRepository";
import { IScheduleRepository } from "@/core/domain/repositories/IScheduleRepository";

// In-Memory Repository Harness implementations for isolated high-speed validation
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

  async create(workOrder: WorkOrder): Promise<WorkOrder> {
    const id = workOrder.id || `wo-${this.workOrders.size + 1}`;
    const saved = new WorkOrder({ ...workOrder, id });
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
        (w) => w.toDoText.toLowerCase().includes(q) || w.orderNumber.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async update(workOrder: WorkOrder): Promise<WorkOrder> {
    this.workOrders.set(workOrder.id, workOrder);
    return workOrder;
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

export class InMemoryScheduleRepository implements IScheduleRepository {
  public schedules: Map<string, MaintenanceSchedule> = new Map();

  async create(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    const id = schedule.id || `sch-${this.schedules.size + 1}`;
    const saved = new MaintenanceSchedule({ ...schedule, id });
    this.schedules.set(id, saved);
    return saved;
  }

  async findById(id: string): Promise<MaintenanceSchedule | null> {
    return this.schedules.get(id) || null;
  }

  async findByVehicleId(vehicleId: string): Promise<MaintenanceSchedule[]> {
    return Array.from(this.schedules.values()).filter((s) => s.vehicleId === vehicleId);
  }

  async listActive(): Promise<MaintenanceSchedule[]> {
    return Array.from(this.schedules.values()).filter((s) => s.isActive);
  }

  async update(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async delete(id: string): Promise<void> {
    this.schedules.delete(id);
  }
}

describe("AAW GarageFlow Evaluation Test Harness - Baseline", () => {
  it("should initialize in-memory evaluation harness successfully", () => {
    const vehicleRepo = new InMemoryVehicleRepository();
    const workOrderRepo = new InMemoryWorkOrderRepository();
    const scheduleRepo = new InMemoryScheduleRepository();

    expect(vehicleRepo).toBeDefined();
    expect(workOrderRepo).toBeDefined();
    expect(scheduleRepo).toBeDefined();
  });
});
