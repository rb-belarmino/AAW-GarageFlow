import { InMemoryVehicleRepository, InMemoryWorkOrderRepository, InMemoryScheduleRepository } from "./garage-flow-harness.test";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { CreateWorkOrderUseCase } from "@/core/use-cases/work-order/CreateWorkOrderUseCase";
import { ToggleWorkOrderDoneUseCase } from "@/core/use-cases/work-order/ToggleWorkOrderDoneUseCase";
import { GetDashboardMetricsUseCase } from "@/core/use-cases/dashboard/GetDashboardMetricsUseCase";

describe("Evaluation Harness - User Story 3 (Fleet Dashboard Summary)", () => {
  it("should match legacy '9/0 Done' ratio accurately as jobs change status", async () => {
    const vehicleRepo = new InMemoryVehicleRepository();
    const workOrderRepo = new InMemoryWorkOrderRepository();
    const scheduleRepo = new InMemoryScheduleRepository();

    const createVehicle = new CreateVehicleUseCase(vehicleRepo);
    const createWorkOrder = new CreateWorkOrderUseCase(workOrderRepo, vehicleRepo);
    const toggleDone = new ToggleWorkOrderDoneUseCase(workOrderRepo);
    const getMetrics = new GetDashboardMetricsUseCase(vehicleRepo, workOrderRepo, scheduleRepo);

    // Seed 9 vehicles matching spreadsheet
    const vehiclesData = [
      { vin: "VIN-GENESIS", make: "Genesis", model: "Sedan", year: 2018, color: "Black" },
      { vin: "VIN-PACIFICA", make: "Chrysler", model: "Pacifica", year: 2017, color: "Gray" },
      { vin: "VIN-EQUINOX", make: "Chevrolet", model: "Equinox", year: 2022, color: "White" },
      { vin: "VIN-FORTE", make: "Kia", model: "Forte", year: 2017, color: "Silver" },
      { vin: "VIN-TESLA", make: "Tesla", model: "Model S", year: 2013, color: "Red" },
      { vin: "VIN-SOUL", make: "Kia", model: "Soul", year: 2015, color: "Yellow" },
      { vin: "VIN-SAHARA", make: "Jeep", model: "Sahara", year: 2012, color: "Green" },
      { vin: "VIN-ELANTRA", make: "Hyundai", model: "Elantra", year: 2020, color: "Black" },
      { vin: "VIN-EVOQUE", make: "Land Rover", model: "Evoque", year: 2015, color: "White" },
    ];

    const workOrderIds: string[] = [];
    for (const v of vehiclesData) {
      const veh = await createVehicle.execute(v);
      const wo = await createWorkOrder.execute({ vehicleId: veh.id, toDoText: "General Inspection" });
      workOrderIds.push(wo.id);
    }

    // Initial state: 0 Done, 9 Open -> "0/9 Done"
    let metrics = await getMetrics.execute();
    expect(metrics.totalVehicles).toBe(9);
    expect(metrics.completedWorkOrders).toBe(0);
    expect(metrics.activeWorkOrders).toBe(9);
    expect(metrics.ratioDoneText).toBe("0/9 Done");

    // Check off all 9 items
    for (const id of workOrderIds) {
      await toggleDone.execute({ workOrderId: id, isDone: true });
    }

    // Final state: 9 Done, 0 Open -> "9/0 Done" (Matches spreadsheet cell E1 "9/0 Done")
    metrics = await getMetrics.execute();
    expect(metrics.completedWorkOrders).toBe(9);
    expect(metrics.activeWorkOrders).toBe(0);
    expect(metrics.ratioDoneText).toBe("9/0 Done");
  });
});
