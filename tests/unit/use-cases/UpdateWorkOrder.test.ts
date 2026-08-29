import { UpdateWorkOrderUseCase } from "@/core/use-cases/work-order/UpdateWorkOrderUseCase";
import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { InMemoryVehicleRepository, InMemoryWorkOrderRepository } from "../../harness/garage-flow-harness.test";

describe("UpdateWorkOrderUseCase", () => {
  let vehicleRepo: InMemoryVehicleRepository;
  let workOrderRepo: InMemoryWorkOrderRepository;
  let createVehicleUseCase: CreateVehicleUseCase;
  let createWorkOrderUseCase: CreateWorkOrderUseCase;
  let updateWorkOrderUseCase: UpdateWorkOrderUseCase;

  beforeEach(() => {
    vehicleRepo = new InMemoryVehicleRepository();
    workOrderRepo = new InMemoryWorkOrderRepository();
    createVehicleUseCase = new CreateVehicleUseCase(vehicleRepo);
    createWorkOrderUseCase = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
    updateWorkOrderUseCase = new UpdateWorkOrderUseCase(workOrderRepo, vehicleRepo);
  });

  it("should update notes, status, and tasks on existing work order", async () => {
    const vehicle = await createVehicleUseCase.execute({
      vin: "1HGCR2F83HA999999",
      year: 2018,
      make: "Jeep",
      model: "Wrangler",
      color: "Red",
    });

    const workOrder = await createWorkOrderUseCase.execute({
      vehicleId: vehicle.id,
      tasks: ["Inspect brakes", "Change oil"],
      notes: "First inspection",
    });

    const updated = await updateWorkOrderUseCase.execute({
      id: workOrder.id,
      notes: "Updated shop notes - customer notified",
      status: "IN_PROGRESS",
      items: [
        { id: workOrder.items[0].id, taskText: "Inspect brakes & rotors", isCompleted: true },
        { id: workOrder.items[1].id, taskText: "Change synthetic oil", isCompleted: false },
        { taskText: "Rotate tires", isCompleted: false },
      ],
    });

    expect(updated.id).toBe(workOrder.id);
    expect(updated.notes).toBe("Updated shop notes - customer notified");
    expect(updated.items.length).toBe(3);
    expect(updated.items[0].taskText).toBe("Inspect brakes & rotors");
    expect(updated.items[0].isCompleted).toBe(true);
    expect(updated.items[2].taskText).toBe("Rotate tires");
    expect(updated.isDone).toBe(false);
  });

  it("should mark work order as done when all updated items are completed", async () => {
    const vehicle = await createVehicleUseCase.execute({
      vin: "1HGCR2F83HA888888",
      year: 2019,
      make: "Ford",
      model: "Explorer",
      color: "Silver",
    });

    const workOrder = await createWorkOrderUseCase.execute({
      vehicleId: vehicle.id,
      tasks: ["Detail car"],
    });

    const updated = await updateWorkOrderUseCase.execute({
      id: workOrder.id,
      items: [
        { id: workOrder.items[0].id, taskText: "Detail car", isCompleted: true },
      ],
    });

    expect(updated.isDone).toBe(true);
    expect(updated.status).toBe("DONE");
    expect(updated.completedAt).toBeDefined();
  });
});
