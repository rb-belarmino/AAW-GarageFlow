"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Car, AlertCircle, Pencil, Wrench } from "lucide-react";
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
  const [isEditOpen, setIsEditOpen] = useState(false);

  // New Vehicle form state
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

  // Edit Vehicle form state
  const [editFormData, setEditFormData] = useState<{
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    color: string;
    licensePlate: string;
    currentMileage: number;
    sourceTag: string;
    status: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleOpenEdit = (veh: VehicleRecord) => {
    setEditError(null);
    setEditFormData({
      id: veh.id,
      vin: veh.vin,
      year: veh.year,
      make: veh.make,
      model: veh.model,
      trim: veh.trim || "",
      color: veh.color,
      licensePlate: veh.licensePlate || "",
      currentMileage: veh.currentMileage,
      sourceTag: veh.sourceTag,
      status: veh.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    setEditError(null);
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/vehicles/${editFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: editFormData.vin,
          year: Number(editFormData.year),
          make: editFormData.make,
          model: editFormData.model,
          trim: editFormData.trim || null,
          color: editFormData.color,
          licensePlate: editFormData.licensePlate || null,
          currentMileage: Number(editFormData.currentMileage),
          sourceTag: editFormData.sourceTag,
          status: editFormData.status,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setEditError(json.error || "Failed to update vehicle");
        return;
      }
      setIsEditOpen(false);
      setEditFormData(null);
      fetchVehicles();
    } catch (err: any) {
      setEditError(err.message || "An unexpected error occurred while updating.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage dealership units, mileage records, VIN identifiers, and quick edit</p>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Trim (Optional)</label>
                  <Input
                    placeholder="e.g. Touring L, Limited"
                    value={formData.trim}
                    onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">License Plate</label>
                  <Input
                    placeholder="e.g. 7XYZ123"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">VIN (17 Characters) *</label>
                <Input
                  required
                  placeholder="e.g. 1HGCR2F83HA123456"
                  className="font-mono text-xs"
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

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-primary" />
                Edit Vehicle Details
              </DialogTitle>
            </DialogHeader>
            {editError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            {editFormData && (
              <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Year *</label>
                    <Input
                      type="number"
                      required
                      value={editFormData.year}
                      onChange={(e) => setEditFormData({ ...editFormData, year: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Color *</label>
                    <Input
                      required
                      placeholder="e.g. Gray, Black"
                      value={editFormData.color}
                      onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Make *</label>
                    <Input
                      required
                      placeholder="e.g. Chrysler, Jeep"
                      value={editFormData.make}
                      onChange={(e) => setEditFormData({ ...editFormData, make: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Model *</label>
                    <Input
                      required
                      placeholder="e.g. Pacifica, Sahara"
                      value={editFormData.model}
                      onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Trim</label>
                    <Input
                      placeholder="e.g. Touring L, Limited"
                      value={editFormData.trim}
                      onChange={(e) => setEditFormData({ ...editFormData, trim: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">License Plate</label>
                    <Input
                      placeholder="e.g. 7XYZ123"
                      value={editFormData.licensePlate}
                      onChange={(e) => setEditFormData({ ...editFormData, licensePlate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">VIN (17 Characters) *</label>
                  <Input
                    required
                    placeholder="e.g. 1HGCR2F83HA123456"
                    className="font-mono text-xs"
                    value={editFormData.vin}
                    onChange={(e) => setEditFormData({ ...editFormData, vin: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold">Mileage</label>
                    <Input
                      type="number"
                      value={editFormData.currentMileage}
                      onChange={(e) => setEditFormData({ ...editFormData, currentMileage: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold">Source Tag</label>
                    <Input
                      value={editFormData.sourceTag}
                      onChange={(e) => setEditFormData({ ...editFormData, sourceTag: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold">Status</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="SOLD">SOLD</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <Link
                    href={`/work-orders?search=${encodeURIComponent(editFormData.vin)}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    onClick={() => setIsEditOpen(false)}
                  >
                    <Wrench className="h-3.5 w-3.5" /> View Service Orders
                  </Link>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={savingEdit}>
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading vehicle inventory...
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No vehicles found. Add your first dealership vehicle above.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((veh) => (
                <TableRow key={veh.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary shrink-0" />
                      <span
                        className="cursor-pointer hover:underline text-primary"
                        onClick={() => handleOpenEdit(veh)}
                        title="Click to edit vehicle"
                      >
                        {veh.year} {veh.make} {veh.model}
                      </span>
                      <span className="text-xs text-muted-foreground">({veh.color})</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => handleOpenEdit(veh)}
                      title="Click to edit vehicle"
                    >
                      {veh.vin}
                    </span>
                  </TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs flex items-center gap-1"
                        onClick={() => handleOpenEdit(veh)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Link href={`/work-orders?search=${encodeURIComponent(veh.vin)}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          title="View work orders for this car"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
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
