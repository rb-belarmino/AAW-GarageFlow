import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { InMemoryVehicleRepository } from "../../harness/garage-flow-harness.test";

describe("CreateVehicleUseCase", () => {
  let vehicleRepo: InMemoryVehicleRepository;
  let useCase: CreateVehicleUseCase;

  beforeEach(() => {
    vehicleRepo = new InMemoryVehicleRepository();
    useCase = new CreateVehicleUseCase(vehicleRepo);
  });

  it("should create a valid vehicle entity in the inventory", async () => {
    const vehicle = await useCase.execute({
      vin: "1HGCR2F83HA123456",
      year: 2017,
      make: "Chrysler",
      model: "Pacifica",
      color: "Gray",
      currentMileage: 45000,
      sourceTag: "AAW Dealer",
    });

    expect(vehicle.id).toBeDefined();
    expect(vehicle.vin).toBe("1HGCR2F83HA123456");
    expect(vehicle.make).toBe("Chrysler");
    expect(vehicle.status).toBe("ACTIVE");
  });

  it("should reject duplicate VIN registration", async () => {
    await useCase.execute({
      vin: "DUPLICATEVIN12345",
      year: 2020,
      make: "Toyota",
      model: "Camry",
      color: "White",
    });

    await expect(
      useCase.execute({
        vin: "DUPLICATEVIN12345",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        color: "White",
      })
    ).rejects.toThrow("already exists");
  });

  it("should reject invalid vehicle year", async () => {
    await expect(
      useCase.execute({
        vin: "VALIDVIN123456789",
        year: 1850,
        make: "Ford",
        model: "Model T",
        color: "Black",
      })
    ).rejects.toThrow("Valid vehicle year is required.");
  });
});
