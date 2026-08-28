import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { ToggleWorkOrderDoneUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderDoneUseCase";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { InMemoryVehicleRepository, InMemoryWorkOrderRepository } from "../../harness/garage-flow-harness.test";

describe("ToggleWorkOrderDoneUseCase", () => {
  let vehicleRepo: InMemoryVehicleRepository;
  let workOrderRepo: InMemoryWorkOrderRepository;
  let createVehicle: CreateVehicleUseCase;
  let createWorkOrder: CreateWorkOrderUseCase;
  let toggleDone: ToggleWorkOrderDoneUseCase;

  beforeEach(() => {
    vehicleRepo = new InMemoryVehicleRepository();
    workOrderRepo = new InMemoryWorkOrderRepository();
    createVehicle = new CreateVehicleUseCase(vehicleRepo);
    createWorkOrder = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
    toggleDone = new ToggleWorkOrderDoneUseCase(workOrderRepo);
  });

  it("should toggle work order status between In Progress and Done (✓)", async () => {
    const vehicle = await createVehicle.execute({
      vin: "TESLAVIN123456789",
      year: 2013,
      make: "Tesla",
      model: "Model S",
      color: "Red",
    });

    const wo = await createWorkOrder.execute({
      vehicleId: vehicle.id,
      toDoText: "Ar conditioner / front right light / Middle screen not working",
    });

    expect(wo.isDone).toBe(false);
    expect(wo.status).toBe("IN_PROGRESS");
    expect(wo.completedAt).toBeNull();

    // Toggle Done
    const completedWO = await toggleDone.execute({
      workOrderId: wo.id,
      isDone: true,
      completedBy: "Mike Lead Tech",
    });

    expect(completedWO.isDone).toBe(true);
    expect(completedWO.status).toBe("DONE");
    expect(completedWO.completedAt).toBeDefined();
    expect(completedWO.completedBy).toBe("Mike Lead Tech");

    // Toggle Back to In Progress
    const reopenedWO = await toggleDone.execute({
      workOrderId: wo.id,
      isDone: false,
    });

    expect(reopenedWO.isDone).toBe(false);
    expect(reopenedWO.status).toBe("IN_PROGRESS");
    expect(reopenedWO.completedAt).toBeNull();
  });
});
