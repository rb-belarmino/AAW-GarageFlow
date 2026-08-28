import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { ToggleWorkOrderItemUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderItemUseCase";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { InMemoryVehicleRepository, InMemoryWorkOrderRepository } from "../../harness/garage-flow-harness.test";

describe("Multi-Task Work Order Lifecycle", () => {
  let vehicleRepo: InMemoryVehicleRepository;
  let workOrderRepo: InMemoryWorkOrderRepository;
  let createVehicle: CreateVehicleUseCase;
  let createWorkOrder: CreateWorkOrderUseCase;
  let toggleItem: ToggleWorkOrderItemUseCase;

  beforeEach(() => {
    vehicleRepo = new InMemoryVehicleRepository();
    workOrderRepo = new InMemoryWorkOrderRepository();
    createVehicle = new CreateVehicleUseCase(vehicleRepo);
    createWorkOrder = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
    toggleItem = new ToggleWorkOrderItemUseCase(workOrderRepo);
  });

  it("should track multi-task completion and auto-shift to DONE when all tasks are complete", async () => {
    const vehicle = await createVehicle.execute({
      vin: "TESLAVIN123456789",
      year: 2013,
      make: "Tesla",
      model: "Model S",
      color: "Red",
    });

    const wo = await createWorkOrder.execute({
      vehicleId: vehicle.id,
      tasks: [
        "Repair Air Conditioner",
        "Replace Front Right Headlight",
        "Diagnose Center Screen",
      ],
    });

    expect(wo.items.length).toBe(3);
    expect(wo.isDone).toBe(false);
    expect(wo.status).toBe("IN_PROGRESS");

    // Complete item 1
    const updated1 = await toggleItem.execute({
      itemId: wo.items[0].id,
      isCompleted: true,
      completedBy: "Mike Lead Tech",
    });
    expect(updated1.completedItemsCount).toBe(1);
    expect(updated1.isDone).toBe(false);

    // Complete item 2
    const updated2 = await toggleItem.execute({
      itemId: wo.items[1].id,
      isCompleted: true,
      completedBy: "Mike Lead Tech",
    });
    expect(updated2.completedItemsCount).toBe(2);
    expect(updated2.isDone).toBe(false);

    // Complete final item 3 -> Shifts to ALL DONE
    const updated3 = await toggleItem.execute({
      itemId: wo.items[2].id,
      isCompleted: true,
      completedBy: "Mike Lead Tech",
    });
    expect(updated3.completedItemsCount).toBe(3);
    expect(updated3.isDone).toBe(true);
    expect(updated3.status).toBe("DONE");
    expect(updated3.completedAt).toBeDefined();
  });
});
