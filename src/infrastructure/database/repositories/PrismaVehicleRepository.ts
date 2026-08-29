import { IVehicleRepository } from "@/core/domain/repositories/IVehicleRepository";
import { Vehicle } from "@/core/domain/entities/Vehicle";
import { prisma } from "../prisma";

export class PrismaVehicleRepository implements IVehicleRepository {
  async create(vehicle: Vehicle): Promise<Vehicle> {
    const created = await prisma.vehicle.create({
      data: {
        id: vehicle.id || undefined,
        vin: vehicle.vin,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        currentMileage: vehicle.currentMileage,
        sourceTag: vehicle.sourceTag,
        status: vehicle.status,
      },
    });

    return new Vehicle(created);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const found = await prisma.vehicle.findUnique({
      where: { id },
    });
    return found ? new Vehicle(found) : null;
  }

  async findByVin(vin: string): Promise<Vehicle | null> {
    const found = await prisma.vehicle.findUnique({
      where: { vin: vin.trim().toUpperCase() },
    });
    return found ? new Vehicle(found) : null;
  }

  async list(filter?: { status?: string; search?: string; sourceTag?: string }): Promise<Vehicle[]> {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.sourceTag) where.sourceTag = filter.sourceTag;
    if (filter?.search) {
      const search = filter.search.trim();
      where.OR = [
        { vin: { contains: search, mode: "insensitive" } },
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const records = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return records.map((r: any) => new Vehicle(r));
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    const updated = await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        vin: vehicle.vin,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        currentMileage: vehicle.currentMileage,
        sourceTag: vehicle.sourceTag,
        status: vehicle.status,
      },
    });

    return new Vehicle(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.vehicle.delete({ where: { id } });
  }

  async count(filter?: { status?: string }): Promise<number> {
    return prisma.vehicle.count({
      where: filter?.status ? { status: filter.status } : undefined,
    });
  }
}
