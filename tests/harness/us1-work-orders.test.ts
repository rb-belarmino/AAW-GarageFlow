import { InMemoryVehicleRepository, InMemoryWorkOrderRepository } from "./garage-flow-harness.test";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { ToggleWorkOrderDoneUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderDoneUseCase";
import { ListWorkOrdersUseCase } from "@/core/use-cases/work-order/ListWorkOrdersUseCase";

describe("Evaluation Harness - User Story 1 (Spreadsheet Workflow & Live Work Orders)", () => {
  it("should faithfully reproduce spreadsheet rows and live updates", async () => {
    const vehicleRepo = new InMemoryVehicleRepository();
    const workOrderRepo = new InMemoryWorkOrderRepository();

    const createVehicle = new CreateVehicleUseCase(vehicleRepo);
    const createWorkOrder = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
    const toggleDone = new ToggleWorkOrderDoneUseCase(workOrderRepo);
    const listWorkOrders = new ListWorkOrdersUseCase(workOrderRepo);

    // 1. Ingest Row from Excel: Genesis
    const genesis = await createVehicle.execute({
      vin: "KMHGN4JE3JU100001",
      year: 2018,
      make: "Genesis",
      model: "G80",
      color: "Black",
    });

    const genesisWO = await createWorkOrder.execute({
      vehicleId: genesis.id,
      toDoText: "take photos / upload at Deal center / Cinto do carona nao trava - Teto solar as vezes nao fecha - camera de ré em azul",
    });

    expect(genesisWO.isDone).toBe(false);
    expect(genesisWO.status).toBe("IN_PROGRESS");

    // 2. Search work orders by free-text keyword "camera"
    const searchResults = await listWorkOrders.execute({ search: "camera" });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].vehicleId).toBe(genesis.id);

    // 3. Mark Done
    await toggleDone.execute({ workOrderId: genesisWO.id, isDone: true, completedBy: "Rodrigo (Tech Lead)" });
    const doneOrders = await listWorkOrders.execute({ isDone: true });
    expect(doneOrders.length).toBe(1);
    expect(doneOrders[0].status).toBe("DONE");
    expect(doneOrders[0].completedBy).toBe("Rodrigo (Tech Lead)");
  });
});
