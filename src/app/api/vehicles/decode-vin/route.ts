import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vin = searchParams.get("vin");

    if (!vin || vin.trim().length !== 17) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 17-character VIN" },
        { status: 400 }
      );
    }

    const sanitizedVin = vin.trim().toUpperCase();
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${sanitizedVin}?format=json`;

    const response = await fetch(nhtsaUrl, {
      next: { revalidate: 86400 }, // Cache response for 24h
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to connect to NHTSA VIN Decoder API" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const result = data.Results?.[0];

    if (!result) {
      return NextResponse.json(
        { success: false, error: "No vehicle information found for this VIN" },
        { status: 404 }
      );
    }

    // Capitalize / format helpers
    const capitalize = (text?: string) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const decoded = {
      vin: sanitizedVin,
      year: result.ModelYear ? parseInt(result.ModelYear, 10) : undefined,
      make: capitalize(result.Make),
      model: result.Model || "",
      trim: result.Trim || "",
      bodyClass: result.BodyClass || "",
      manufacturer: result.Manufacturer || "",
      plantCountry: result.PlantCountry || "",
      doors: result.Doors ? parseInt(result.Doors, 10) : undefined,
      engineCylinders: result.EngineCylinders || "",
      displacementL: result.DisplacementL ? `${result.DisplacementL}L` : "",
      fuelType: result.FuelTypePrimary || "",
      driveType: result.DriveType || "",
      vehicleType: result.VehicleType || "",
      errorCode: result.ErrorCode,
      errorText: result.ErrorText,
    };

    return NextResponse.json({ success: true, data: decoded });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to decode VIN" },
      { status: 500 }
    );
  }
}
