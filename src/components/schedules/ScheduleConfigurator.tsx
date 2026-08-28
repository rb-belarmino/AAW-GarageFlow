"use client";

import { useState, useEffect } from "react";
import { Plus, CalendarClock, Play, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate, formatMileage } from "@/lib/utils";
import { VehicleOption } from "@/components/work-orders/WorkOrderBoard";

export interface ScheduleRecord {
  id: string;
  vehicleId: string;
  serviceName: string;
  defaultToDoText: string;
  recurrenceType: "TIME_BASED" | "MILEAGE_BASED" | "BOTH";
  intervalMonths?: number | null;
  intervalMiles?: number | null;
  lastServicedDate?: string | null;
  lastServicedMileage?: number | null;
  nextDueDate?: string | null;
  nextDueMileage?: number | null;
  isActive: boolean;
}

export function ScheduleConfigurator() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceName: "Synthetic Oil & Filter Change",
    defaultToDoText: "Perform synthetic oil change, replace oil filter, top off fluids, perform 21-point safety inspection",
    recurrenceType: "BOTH",
    intervalMonths: 6,
    intervalMiles: 5000,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/schedules");
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data);
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
    fetchSchedules();
    fetchVehicles();
  }, []);

  const handleRunEvaluation = async () => {
    try {
      setEvaluating(true);
      setEvalResult(null);
      const res = await fetch("/api/schedules/evaluate", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        const count = json.data.dispatchedCount;
        setEvalResult(
          count > 0
            ? `Successfully auto-dispatched ${count} maintenance work order(s) into the technician queue!`
            : `All ${json.data.evaluatedCount} active maintenance schedules are currently up to date. 0 orders needed dispatch.`
        );
      }
    } catch (e: any) {
      setError(e.message || "Failed to evaluate schedules");
    } finally {
      setEvaluating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          intervalMonths: formData.intervalMonths ? Number(formData.intervalMonths) : null,
          intervalMiles: formData.intervalMiles ? Number(formData.intervalMiles) : null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to create schedule");
        return;
      }
      setIsOpen(false);
      fetchSchedules();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring Preventive Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Configure mileage and calendar intervals to auto-dispatch active work orders directly into the queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5"
            onClick={handleRunEvaluation}
            disabled={evaluating}
          >
            <Play className="h-4 w-4" />
            {evaluating ? "Evaluating Fleet..." : "Run Maintenance Scan"}
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Configure Recurring Maintenance</DialogTitle>
              </DialogHeader>
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Vehicle *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.vehicleId}
                    required
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.color}) - {v.vin}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Service Name *</label>
                  <Input
                    required
                    placeholder="e.g. Brake Pad Inspection & Rotor Resurface"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Every (Months)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 6"
                      value={formData.intervalMonths}
                      onChange={(e) => setFormData({ ...formData, intervalMonths: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Every (Miles)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.intervalMiles}
                      onChange={(e) => setFormData({ ...formData, intervalMiles: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Default "To Do" Instructions *</label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Instructions populated into auto-dispatched work order"
                    value={formData.defaultToDoText}
                    onChange={(e) => setFormData({ ...formData, defaultToDoText: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Maintenance Rule</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {evalResult && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{evalResult}</span>
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Interval Rule</TableHead>
              <TableHead>Next Due Date</TableHead>
              <TableHead>Next Due Mileage</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading recurring schedules...
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No recurring schedules configured yet. Add one above.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((sch) => {
                const veh = vehicleMap.get(sch.vehicleId);
                return (
                  <TableRow key={sch.id}>
                    <TableCell className="font-medium">
                      {veh ? (
                        <div>
                          <span>{veh.year} {veh.make} {veh.model}</span>
                          <div className="text-xs text-muted-foreground font-mono">{veh.vin}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{sch.vehicleId}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">{sch.serviceName}</TableCell>
                    <TableCell className="text-xs">
                      {sch.intervalMonths ? `Every ${sch.intervalMonths} mo` : ""}
                      {sch.intervalMonths && sch.intervalMiles ? " or " : ""}
                      {sch.intervalMiles ? `${formatMileage(sch.intervalMiles)}` : ""}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(sch.nextDueDate)}</TableCell>
                    <TableCell className="text-xs">{formatMileage(sch.nextDueMileage)}</TableCell>
                    <TableCell>
                      <Badge variant={sch.isActive ? "success" : "secondary"}>
                        {sch.isActive ? "ACTIVE" : "PAUSED"}
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
