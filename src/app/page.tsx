import Link from "next/link";
import { Wrench, Car, ArrowRight, FileSpreadsheet, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PrismaVehicleRepository } from "@/infrastructure/database/repositories/PrismaVehicleRepository";
import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { GetDashboardMetricsUseCase } from "@/core/use-cases/dashboard/GetDashboardMetricsUseCase";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { formatDate } from "@/lib/utils";

// Server Component fetching real-time dashboard data
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const vehicleRepo = new PrismaVehicleRepository();
  const workOrderRepo = new PrismaWorkOrderRepository();
  const getMetricsUseCase = new GetDashboardMetricsUseCase(vehicleRepo, workOrderRepo);

  let metrics;
  try {
    metrics = await getMetricsUseCase.execute();
  } catch (e) {
    metrics = {
      totalVehicles: 0,
      activeWorkOrders: 0,
      completedWorkOrders: 0,
      ratioDoneText: "0/0 Done",
      recentWorkOrders: [],
    };
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dealer Yard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time dealership service & repair task tracking for incoming cars
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/work-orders">
            <Button className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Work Order Board
            </Button>
          </Link>
          <Link href="/vehicles">
            <Button variant="outline" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Add Vehicle
            </Button>
          </Link>
        </div>
      </div>

      <MetricCards
        totalVehicles={metrics.totalVehicles}
        activeWorkOrders={metrics.activeWorkOrders}
        completedWorkOrders={metrics.completedWorkOrders}
        ratioDoneText={metrics.ratioDoneText}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Live Work Order Stream</CardTitle>
              <CardDescription>Recent vehicles and their itemized inspection & repair tasks</CardDescription>
            </div>
            <Link href="/work-orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {metrics.recentWorkOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm border border-dashed rounded-lg">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No active work orders. Create one in the Work Order board or run the database seed.
              </div>
            ) : (
              <div className="divide-y rounded-lg border bg-card">
                {metrics.recentWorkOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/work-orders?search=${encodeURIComponent(order.orderNumber)}`}>
                          <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold hover:underline">
                            {order.orderNumber}
                          </span>
                        </Link>
                        <Link href={`/vehicles?search=${encodeURIComponent(order.vin)}`} className="font-semibold text-sm hover:underline hover:text-primary">
                          {order.vehicleName}
                        </Link>
                        <span className="font-mono text-xs text-muted-foreground">({order.vin})</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {order.toDoText}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={order.isDone ? "success" : "warning"} className="text-[11px]">
                        {order.isDone ? "ALL DONE" : "IN PROGRESS"}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Direct navigation shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/work-orders">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Wrench className="h-3.5 w-3.5 mr-2" />
                  View Work Orders & Checklists
                </Button>
              </Link>
              <Link href="/vehicles">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Car className="h-3.5 w-3.5 mr-2" />
                  Register New Vehicle
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
