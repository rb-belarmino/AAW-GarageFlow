"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Car, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatMileage, formatDate } from "@/lib/utils";

export interface VehicleRecord {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  color: string;
  licensePlate?: string | null;
  currentMileage: number;
  sourceTag: string;
  status: string;
  createdAt: string;
}

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vin: "",
    year: new Date().getFullYear(),
    make: "",
    model: "",
    trim: "",
    color: "",
    licensePlate: "",
    currentMileage: 0,
    sourceTag: "AAW Dealer",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const url = search ? `/api/vehicles?search=${encodeURIComponent(search)}` : `/api/vehicles`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setVehicles(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
          currentMileage: Number(formData.currentMileage),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to create vehicle");
        return;
      }
      setIsOpen(false);
      setFormData({
        vin: "",
        year: new Date().getFullYear(),
        make: "",
        model: "",
        trim: "",
        color: "",
        licensePlate: "",
        currentMileage: 0,
        sourceTag: "AAW Dealer",
      });
      fetchVehicles();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage dealership units, mileage records, and VIN identifiers</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
            </DialogHeader>
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Year *</label>
                  <Input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Color *</label>
                  <Input
                    required
                    placeholder="e.g. Gray, Black"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Make *</label>
                  <Input
                    required
                    placeholder="e.g. Chrysler, Jeep"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Model *</label>
                  <Input
                    required
                    placeholder="e.g. Pacifica, Sahara"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">VIN (17 Characters) *</label>
                <Input
                  required
                  placeholder="e.g. 1HGCR2F83HA123456"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Current Mileage</label>
                  <Input
                    type="number"
                    value={formData.currentMileage}
                    onChange={(e) => setFormData({ ...formData, currentMileage: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Source Tag</label>
                  <Input
                    value={formData.sourceTag}
                    onChange={(e) => setFormData({ ...formData, sourceTag: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Vehicle</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles by VIN, make, model, or color..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year / Car / Color</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Current Mileage</TableHead>
              <TableHead>Source Tag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading vehicle inventory...
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No vehicles found. Add your first dealership vehicle above.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((veh) => (
                <TableRow key={veh.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary shrink-0" />
                      <span>{veh.year} {veh.make} {veh.model}</span>
                      <span className="text-xs text-muted-foreground">({veh.color})</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{veh.vin}</TableCell>
                  <TableCell>{formatMileage(veh.currentMileage)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{veh.sourceTag}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={veh.status === "ACTIVE" ? "success" : "secondary"}>
                      {veh.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(veh.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
