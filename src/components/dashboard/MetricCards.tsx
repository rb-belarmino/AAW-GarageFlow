"use client";

import { Car, Wrench, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricCardsProps {
  totalVehicles: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  ratioDoneText: string;
}

export function MetricCards({
  totalVehicles,
  activeWorkOrders,
  completedWorkOrders,
  ratioDoneText,
}: MetricCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Fleet Inventory</CardTitle>
          <Car className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVehicles}</div>
          <p className="text-xs text-muted-foreground">Dealership cars in yard</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Progress Tasks</CardTitle>
          <Wrench className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeWorkOrders}</div>
          <p className="text-xs text-muted-foreground">Cars with pending repair & photo items</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed Ratio</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{ratioDoneText}</span>
            <Badge variant="success" className="text-xs">Live Rate</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{completedWorkOrders} cars completed and ready</p>
        </CardContent>
      </Card>
    </div>
  );
}
