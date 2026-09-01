import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";

export class DeleteVehicleUseCase {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.vehicleRepository.findById(id);
    if (!existing) {
      throw new Error(`Vehicle with ID ${id} was not found.`);
    }

    await this.vehicleRepository.delete(id);
  }
}
