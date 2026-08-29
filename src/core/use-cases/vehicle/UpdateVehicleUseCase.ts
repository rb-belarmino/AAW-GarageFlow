import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { Vehicle } from "@/core/domain/entities/Vehicle";

export interface UpdateVehicleDTO {
  id: string;
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string | null;
  color?: string;
  licensePlate?: string | null;
  currentMileage?: number;
  sourceTag?: string;
  status?: string;
}

export class UpdateVehicleUseCase {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(dto: UpdateVehicleDTO): Promise<Vehicle> {
    if (!dto.id) {
      throw new Error("Vehicle ID is required for update.");
    }

    const existing = await this.vehicleRepository.findById(dto.id);
    if (!existing) {
      throw new Error(`Vehicle with ID ${dto.id} not found.`);
    }

    if (dto.vin && dto.vin.trim().toUpperCase() !== existing.vin) {
      const vinMatch = await this.vehicleRepository.findByVin(dto.vin);
      if (vinMatch && vinMatch.id !== dto.id) {
        throw new Error(`Vehicle with VIN ${dto.vin} already exists.`);
      }
    }

    const updatedVehicle = new Vehicle({
      id: existing.id,
      vin: dto.vin !== undefined ? dto.vin : existing.vin,
      year: dto.year !== undefined ? dto.year : existing.year,
      make: dto.make !== undefined ? dto.make : existing.make,
      model: dto.model !== undefined ? dto.model : existing.model,
      trim: dto.trim !== undefined ? dto.trim : existing.trim,
      color: dto.color !== undefined ? dto.color : existing.color,
      licensePlate: dto.licensePlate !== undefined ? dto.licensePlate : existing.licensePlate,
      currentMileage: dto.currentMileage !== undefined ? dto.currentMileage : existing.currentMileage,
      sourceTag: dto.sourceTag !== undefined ? dto.sourceTag : existing.sourceTag,
      status: dto.status !== undefined ? dto.status : existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return await this.vehicleRepository.update(updatedVehicle);
  }
}
