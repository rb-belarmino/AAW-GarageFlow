import { InMemoryVehicleRepository, InMemoryWorkOrderRepository } from "./garage-flow-harness.test";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { ToggleWorkOrderItemUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderItemUseCase";
import { ListWorkOrdersUseCase } from "@/core/use-cases/work-order/ListWorkOrdersUseCase";

describe("Evaluation Harness - User Story 1 (Multi-Task Work Orders)", () => {
  it("should split and manage itemized tasks for spreadsheet rows", async () => {
    const vehicleRepo = new InMemoryVehicleRepository();
    const workOrderRepo = new InMemoryWorkOrderRepository();

    const createVehicle = new CreateVehicleUseCase(vehicleRepo);
    const createWorkOrder = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
    const toggleItem = new ToggleWorkOrderItemUseCase(workOrderRepo);
    const listWorkOrders = new ListWorkOrdersUseCase(workOrderRepo);

    // 1. Ingest Genesis row with multiple discrete tasks
    const genesis = await createVehicle.execute({
      vin: "KMHGN4JE3JU100001",
      year: 2018,
      make: "Genesis",
      model: "G80",
      color: "Black",
    });

    const genesisWO = await createWorkOrder.execute({
      vehicleId: genesis.id,
      tasks: [
        "Take photos & upload to Deal Center",
        "Fix passenger seatbelt lock mechanism",
        "Service sunroof alignment",
        "Troubleshoot blue rear backup camera screen",
      ],
    });

    expect(genesisWO.items.length).toBe(4);
    expect(genesisWO.isDone).toBe(false);
    expect(genesisWO.status).toBe("IN_PROGRESS");

    // 2. Search work orders by task keyword "camera"
    const searchResults = await listWorkOrders.execute({ search: "camera" });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].vehicleId).toBe(genesis.id);

    // 3. Mark all 4 items completed
    for (const item of genesisWO.items) {
      await toggleItem.execute({ itemId: item.id, isCompleted: true, completedBy: "Rodrigo (Tech Lead)" });
    }

    const doneOrders = await listWorkOrders.execute({ isDone: true });
    expect(doneOrders.length).toBe(1);
    expect(doneOrders[0].isDone).toBe(true);
    expect(doneOrders[0].status).toBe("DONE");
  });
});
