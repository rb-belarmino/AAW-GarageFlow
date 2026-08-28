"use client";

import { useState, useEffect } from "react";
import { Plus, Search, CheckCircle2, Clock, Wrench, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

export interface WorkOrderRecord {
  id: string;
  orderNumber: string;
  vehicleId: string;
  toDoText: string;
  isDone: boolean;
  status: string;
  scheduledDate?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface VehicleOption {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  color: string;
}

export function WorkOrderBoard() {
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterDone, setFilterDone] = useState<string>("ALL"); // ALL, OPEN, DONE
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "",
    toDoText: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      let url = `/api/work-orders?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (filterDone === "OPEN") url += `isDone=false&`;
      if (filterDone === "DONE") url += `isDone=true&`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setWorkOrders(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      const json = await res.json();
      if (json.success) {
        setVehicles(json.data);
        if (json.data.length > 0 && !formData.vehicleId) {
          setFormData((prev) => ({ ...prev, vehicleId: json.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [search, filterDone]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleToggleDone = async (workOrderId: string, currentDone: boolean) => {
    const nextDone = !currentDone;
    // Optimistic UI update
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              isDone: nextDone,
              status: nextDone ? "DONE" : "IN_PROGRESS",
              completedAt: nextDone ? new Date().toISOString() : null,
            }
          : wo
      )
    );

    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/toggle-done`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone: nextDone, completedBy: "Technician" }),
      });
      const json = await res.json();
      if (!json.success) {
        fetchWorkOrders(); // Revert on failure
      }
    } catch (e) {
      fetchWorkOrders();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to create work order");
        return;
      }
      setIsOpen(false);
      setFormData({
        vehicleId: vehicles[0]?.id || "",
        toDoText: "",
        notes: "",
      });
      fetchWorkOrders();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const doneCount = workOrders.filter((w) => w.isDone).length;
  const openCount = workOrders.filter((w) => !w.isDone).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Work Orders & Tasks</h1>
            <Badge variant="outline" className="text-sm font-semibold py-1 px-3 bg-muted/40">
              {doneCount}/{openCount} Done
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Digital task tracker matching Dealer Cars / To Do spreadsheet with real-time checkoffs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchWorkOrders()} className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Work Order & Checklist</DialogTitle>
              </DialogHeader>
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Select Vehicle *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.vehicleId}
                    required
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  >
                    {vehicles.length === 0 ? (
                      <option value="">No vehicles found - Register vehicle first</option>
                    ) : (
                      vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model} ({v.color}) - {v.vin}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">To Do (Free-form repairs, notes & portal instructions) *</label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="e.g. take photos / upload at Deal center / Cinto do carona nao trava - Teto solar as vezes nao fecha - camera de ré em azul"
                    value={formData.toDoText}
                    onChange={(e) => setFormData({ ...formData, toDoText: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Accepts multi-line inspection items, repair defects, and external upload tasks.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Internal Shop Notes (Optional)</label>
                  <Input
                    placeholder="e.g. Customer waiting in lobby / parts on order"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={vehicles.length === 0}>
                    Dispatch Work Order
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by 'To Do' keyword, VIN, or Order Number..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          <Button
            variant={filterDone === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterDone("ALL")}
          >
            All ({workOrders.length})
          </Button>
          <Button
            variant={filterDone === "OPEN" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterDone("OPEN")}
          >
            In Progress
          </Button>
          <Button
            variant={filterDone === "DONE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterDone("DONE")}
          >
            Done (✓)
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">✓ Done</TableHead>
              <TableHead className="w-52">Year / Car / Color</TableHead>
              <TableHead className="w-36">VIN</TableHead>
              <TableHead>To Do (Repairs & Tasks)</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading work orders...
                </TableCell>
              </TableRow>
            ) : workOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No work orders found. Create your first work order above.
                </TableCell>
              </TableRow>
            ) : (
              workOrders.map((wo) => {
                const veh = vehicleMap.get(wo.vehicleId);
                return (
                  <TableRow
                    key={wo.id}
                    className={wo.isDone ? "bg-muted/20 opacity-80" : "hover:bg-muted/30"}
                  >
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        <Switch
                          checked={wo.isDone}
                          onCheckedChange={() => handleToggleDone(wo.id, wo.isDone)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {veh ? (
                        <div>
                          <div className="text-sm font-semibold">
                            {veh.year} {veh.make} {veh.model}
                          </div>
                          <div className="text-xs text-muted-foreground">Color: {veh.color}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Vehicle ID: {wo.vehicleId}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {veh ? veh.vin : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {wo.toDoText}
                      </div>
                      {wo.notes && (
                        <div className="mt-1 text-xs text-muted-foreground italic">
                          Notes: {wo.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={wo.isDone ? "success" : "warning"} className="font-mono text-xs">
                        {wo.isDone ? "DONE" : "IN PROGRESS"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
