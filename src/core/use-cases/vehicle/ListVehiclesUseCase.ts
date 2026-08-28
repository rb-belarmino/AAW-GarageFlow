import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { Vehicle } from "@/core/domain/entities/Vehicle";

export interface ListVehiclesDTO {
  status?: string;
  search?: string;
  sourceTag?: string;
}

export class ListVehiclesUseCase {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(dto?: ListVehiclesDTO): Promise<Vehicle[]> {
    return await this.vehicleRepository.list(dto);
  }
}
