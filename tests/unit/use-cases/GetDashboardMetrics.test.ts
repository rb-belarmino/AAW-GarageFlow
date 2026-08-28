import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { ToggleWorkOrderDoneUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderDoneUseCase";
import { GetDashboardMetricsUseCase } from "@/core/use-cases/dashboard/GetDashboardMetricsUseCase";
import { InMemoryVehicleRepository, InMemoryWorkOrderRepository } from "../../harness/garage-flow-harness.test";

describe("GetDashboardMetricsUseCase", () => {
  it("should calculate correct fleet metrics and ratioDoneText summary", async () => {
    const vehicleRepo = new InMemoryVehicleRepository();
    const workOrderRepo = new InMemoryWorkOrderRepository();

    const createVehicle = new CreateVehicleUseCase(vehicleRepo);
    const createWorkOrder = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
    const toggleDone = new ToggleWorkOrderDoneUseCase(workOrderRepo);
    const getMetrics = new GetDashboardMetricsUseCase(vehicleRepo, workOrderRepo);

    // Create 3 vehicles
    const v1 = await createVehicle.execute({ vin: "VIN1", year: 2020, make: "Kia", model: "Soul", color: "Blue" });
    const v2 = await createVehicle.execute({ vin: "VIN2", year: 2012, make: "Jeep", model: "Sahara", color: "Green" });
    const v3 = await createVehicle.execute({ vin: "VIN3", year: 2022, make: "Chevy", model: "Equinox", color: "White" });

    // Create work orders
    const wo1 = await createWorkOrder.execute({ vehicleId: v1.id, toDoText: "OK" });
    const wo2 = await createWorkOrder.execute({ vehicleId: v2.id, toDoText: "Checking engine light" });
    const wo3 = await createWorkOrder.execute({ vehicleId: v3.id, toDoText: "Multimedia screen fix" });

    // Mark wo1 as Done (✓)
    await toggleDone.execute({ workOrderId: wo1.id, isDone: true });

    const metrics = await getMetrics.execute();

    expect(metrics.totalVehicles).toBe(3);
    expect(metrics.completedWorkOrders).toBe(1);
    expect(metrics.activeWorkOrders).toBe(2);
    expect(metrics.ratioDoneText).toBe("1/2 Done");
  });
});
