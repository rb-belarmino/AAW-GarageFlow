export interface VehicleProps {
  id?: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  color: string;
  licensePlate?: string | null;
  currentMileage?: number;
  sourceTag?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Vehicle {
  public readonly id: string;
  public readonly vin: string;
  public readonly year: number;
  public readonly make: string;
  public readonly model: string;
  public readonly trim?: string | null;
  public readonly color: string;
  public readonly licensePlate?: string | null;
  public currentMileage: number;
  public sourceTag: string;
  public status: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: VehicleProps) {
    if (!props.vin || props.vin.trim().length === 0) {
      throw new Error("Vehicle VIN is required.");
    }
    if (!props.year || props.year < 1900 || props.year > new Date().getFullYear() + 2) {
      throw new Error("Valid vehicle year is required.");
    }
    if (!props.make || props.make.trim().length === 0) {
      throw new Error("Vehicle make is required.");
    }
    if (!props.model || props.model.trim().length === 0) {
      throw new Error("Vehicle model is required.");
    }
    if (!props.color || props.color.trim().length === 0) {
      throw new Error("Vehicle color is required.");
    }

    this.id = props.id || "";
    this.vin = props.vin.trim().toUpperCase();
    this.year = props.year;
    this.make = props.make.trim();
    this.model = props.model.trim();
    this.trim = props.trim?.trim() || null;
    this.color = props.color.trim();
    this.licensePlate = props.licensePlate?.trim().toUpperCase() || null;
    this.currentMileage = props.currentMileage ?? 0;
    this.sourceTag = props.sourceTag?.trim() || "AAW Dealer";
    this.status = props.status || "ACTIVE";
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public updateMileage(newMileage: number): void {
    if (newMileage < this.currentMileage) {
      throw new Error("New mileage cannot be less than current vehicle mileage.");
    }
    this.currentMileage = newMileage;
  }
}
