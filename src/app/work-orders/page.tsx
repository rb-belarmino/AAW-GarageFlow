import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { WorkOrderBoard } from "@/components/work-orders/WorkOrderBoard";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return <WorkOrderBoard />;
}
