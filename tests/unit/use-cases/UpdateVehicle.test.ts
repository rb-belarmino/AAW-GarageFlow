import { UpdateVehicleUseCase } from "@/core/use-cases/vehicle/UpdateVehicleUseCase";
import { CreateVehicleUseCase } from "@/core/use-cases/vehicle/CreateVehicleUseCase";
import { InMemoryVehicleRepository } from "../../harness/garage-flow-harness.test";

describe("UpdateVehicleUseCase", () => {
  let vehicleRepo: InMemoryVehicleRepository;
  let createUseCase: CreateVehicleUseCase;
  let updateUseCase: UpdateVehicleUseCase;

  beforeEach(() => {
    vehicleRepo = new InMemoryVehicleRepository();
    createUseCase = new CreateVehicleUseCase(vehicleRepo);
    updateUseCase = new UpdateVehicleUseCase(vehicleRepo);
  });

  it("should successfully update existing vehicle fields", async () => {
    const created = await createUseCase.execute({
      vin: "1HGCR2F83HA123456",
      year: 2017,
      make: "Chrysler",
      model: "Pacifica",
      color: "Gray",
      currentMileage: 45000,
      sourceTag: "AAW Dealer",
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      color: "Black",
      currentMileage: 48000,
      trim: "Limited",
      licensePlate: "7XYZ999",
      status: "MAINTENANCE",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.color).toBe("Black");
    expect(updated.currentMileage).toBe(48000);
    expect(updated.trim).toBe("Limited");
    expect(updated.licensePlate).toBe("7XYZ999");
    expect(updated.status).toBe("MAINTENANCE");
  });

  it("should reject updating a non-existent vehicle", async () => {
    await expect(
      updateUseCase.execute({
        id: "non-existent-id",
        color: "Red",
      })
    ).rejects.toThrow("not found");
  });

  it("should reject updating to a VIN that belongs to another vehicle", async () => {
    await createUseCase.execute({
      vin: "VINONE12345678901",
      year: 2020,
      make: "Toyota",
      model: "Camry",
      color: "White",
    });

    const vehicle2 = await createUseCase.execute({
      vin: "VINTWO12345678902",
      year: 2021,
      make: "Honda",
      model: "Civic",
      color: "Blue",
    });

    await expect(
      updateUseCase.execute({
        id: vehicle2.id,
        vin: "VINONE12345678901",
      })
    ).rejects.toThrow("already exists");
  });
});
