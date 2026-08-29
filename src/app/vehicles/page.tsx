import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { VehicleManagement } from "@/components/vehicles/VehicleManagement";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return <VehicleManagement />;
}
