import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { Vehicle, VehicleProps } from "@/core/domain/entities/Vehicle";

export interface CreateVehicleDTO {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  color: string;
  licensePlate?: string | null;
  currentMileage?: number;
  sourceTag?: string;
}

export class CreateVehicleUseCase {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(dto: CreateVehicleDTO): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findByVin(dto.vin);
    if (existing) {
      throw new Error(`Vehicle with VIN ${dto.vin.toUpperCase()} already exists in the system.`);
    }

    const vehicle = new Vehicle(dto);
    return await this.vehicleRepository.create(vehicle);
  }
}
