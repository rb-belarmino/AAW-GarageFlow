import { DeleteVehicleUseCase } from "@/core/use-cases/vehicle/DeleteVehicleUseCase";
import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { Vehicle } from "@/core/domain/entities/Vehicle";

describe("DeleteVehicleUseCase", () => {
  let mockVehicleRepo: jest.Mocked<IVehicleRepository>;
  let deleteVehicleUseCase: DeleteVehicleUseCase;

  beforeEach(() => {
    mockVehicleRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByVin: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    deleteVehicleUseCase = new DeleteVehicleUseCase(mockVehicleRepo);
  });

  it("should delete an existing vehicle successfully", async () => {
    const mockVehicle = new Vehicle({
      id: "v-123",
      vin: "1HGCR2F83HA123456",
      year: 2023,
      make: "Honda",
      model: "Civic",
      color: "Blue",
      currentMileage: 15000,
    });

    mockVehicleRepo.findById.mockResolvedValue(mockVehicle);
    mockVehicleRepo.delete.mockResolvedValue(undefined);

    await expect(deleteVehicleUseCase.execute("v-123")).resolves.toBeUndefined();
    expect(mockVehicleRepo.findById).toHaveBeenCalledWith("v-123");
    expect(mockVehicleRepo.delete).toHaveBeenCalledWith("v-123");
  });

  it("should throw an error if the vehicle does not exist", async () => {
    mockVehicleRepo.findById.mockResolvedValue(null);

    await expect(deleteVehicleUseCase.execute("non-existent")).rejects.toThrow(
      "Vehicle with ID non-existent was not found."
    );
    expect(mockVehicleRepo.delete).not.toHaveBeenCalled();
  });
});
