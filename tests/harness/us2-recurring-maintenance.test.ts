import { InMemoryVehicleRepository, InMemoryWorkOrderRepository, InMemoryScheduleRepository } from "./garage-flow-harness.test";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { CreateScheduleUseCase } from "@/core/use-cases/schedule/CreateScheduleUseCase";
import { EvaluateRecurringSchedulesUseCase } from "@/core/use-cases/schedule/EvaluateRecurringSchedulesUseCase";

describe("Evaluation Harness - User Story 2 (Recurring Maintenance & Auto-Dispatch)", () => {
  it("should evaluate time and mileage thresholds across multiple fleet vehicles", async () => {
    const vehicleRepo = new InMemoryVehicleRepository();
    const workOrderRepo = new InMemoryWorkOrderRepository();
    const scheduleRepo = new InMemoryScheduleRepository();

    const createVehicle = new CreateVehicleUseCase(vehicleRepo);
    const createSchedule = new CreateScheduleUseCase(scheduleRepo, vehicleRepo);
    const evaluate = new EvaluateRecurringSchedulesUseCase(scheduleRepo, vehicleRepo, workOrderRepo);

    // Vehicle 1: Due by Date
    const v1 = await createVehicle.execute({
      vin: "VIN-TIME-DUE",
      year: 2017,
      make: "Kia",
      model: "Forte",
      color: "Silver",
      currentMileage: 20000,
    });

    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 7); // 7 months ago

    const sch1 = await createSchedule.execute({
      vehicleId: v1.id,
      serviceName: "Brake Fluid Flush",
      defaultToDoText: "Flush and replace DOT4 brake fluid",
      recurrenceType: "TIME_BASED",
      intervalMonths: 6,
      lastServicedDate: pastDate,
    });

    // Vehicle 2: Not Due Yet
    const v2 = await createVehicle.execute({
      vin: "VIN-NOT-DUE",
      year: 2022,
      make: "Chevy",
      model: "Equinox",
      color: "Blue",
      currentMileage: 10000,
    });

    await createSchedule.execute({
      vehicleId: v2.id,
      serviceName: "Tire Rotation",
      defaultToDoText: "Rotate and balance 4 tires",
      recurrenceType: "MILEAGE_BASED",
      intervalMiles: 7500,
      lastServicedMileage: 10000,
    });

    const result = await evaluate.execute(new Date());

    expect(result.evaluatedCount).toBe(2);
    expect(result.dispatchedCount).toBe(1);
    expect(result.dispatchedOrders[0].vehicleVin).toBe("VIN-TIME-DUE");
    expect(result.dispatchedOrders[0].serviceName).toBe("Brake Fluid Flush");
  });
});
