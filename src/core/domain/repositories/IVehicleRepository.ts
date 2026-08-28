import { Vehicle } from "../entities/Vehicle";

export interface IVehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByVin(vin: string): Promise<Vehicle | null>;
  list(filter?: { status?: string; search?: string; sourceTag?: string }): Promise<Vehicle[]>;
  update(vehicle: Vehicle): Promise<Vehicle>;
  delete(id: string): Promise<void>;
  count(filter?: { status?: string }): Promise<number>;
}
