import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { CreateScheduleUseCase } from "@/core/use-cases/schedule/CreateScheduleUseCase";
import { EvaluateRecurringSchedulesUseCase } from "@/core/use-cases/schedule/EvaluateRecurringSchedulesUseCase";
import { InMemoryVehicleRepository, InMemoryWorkOrderRepository, InMemoryScheduleRepository } from "../../harness/garage-flow-harness.test";

describe("EvaluateRecurringSchedulesUseCase", () => {
  let vehicleRepo: InMemoryVehicleRepository;
  let workOrderRepo: InMemoryWorkOrderRepository;
  let scheduleRepo: InMemoryScheduleRepository;
  let createVehicle: CreateVehicleUseCase;
  let createSchedule: CreateScheduleUseCase;
  let evaluateSchedules: EvaluateRecurringSchedulesUseCase;

  beforeEach(() => {
    vehicleRepo = new InMemoryVehicleRepository();
    workOrderRepo = new InMemoryWorkOrderRepository();
    scheduleRepo = new InMemoryScheduleRepository();
    createVehicle = new CreateVehicleUseCase(vehicleRepo);
    createSchedule = new CreateScheduleUseCase(scheduleRepo, vehicleRepo);
    evaluateSchedules = new EvaluateRecurringSchedulesUseCase(scheduleRepo, vehicleRepo, workOrderRepo);
  });

  it("should auto-dispatch an active work order when vehicle mileage crosses threshold", async () => {
    const vehicle = await createVehicle.execute({
      vin: "PACIFICAVIN99999",
      year: 2017,
      make: "Chrysler",
      model: "Pacifica",
      color: "Gray",
      currentMileage: 40000,
    });

    // Schedule: Every 5,000 miles
    await createSchedule.execute({
      vehicleId: vehicle.id,
      serviceName: "Oil & Filter Change",
      defaultToDoText: "Perform full synthetic oil change & replace OEM oil filter",
      recurrenceType: "MILEAGE_BASED",
      intervalMiles: 5000,
      lastServicedMileage: 40000,
    });

    // Vehicle now reached 45,500 miles (threshold is 45,000)
    vehicle.updateMileage(45500);
    await vehicleRepo.update(vehicle);

    const result = await evaluateSchedules.execute();

    expect(result.dispatchedCount).toBe(1);
    expect(result.dispatchedOrders[0].vehicleVin).toBe("PACIFICAVIN99999");
    expect(result.dispatchedOrders[0].serviceName).toBe("Oil & Filter Change");

    const workOrders = await workOrderRepo.list();
    expect(workOrders.length).toBe(1);
    expect(workOrders[0].status).toBe("IN_PROGRESS");
    expect(workOrders[0].isDone).toBe(false);
    expect(workOrders[0].toDoText).toContain("Perform full synthetic oil change");
  });
});
