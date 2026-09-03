"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, CheckCircle2, Circle, Clock, Wrench, AlertCircle, RefreshCw, ChevronDown, Trash2, Car, Pencil, ExternalLink, StickyNote, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

export interface WorkOrderItemRecord {
  id: string;
  workOrderId: string;
  taskText: string;
  notes?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  completedBy?: string | null;
  orderIndex: number;
}


export interface WorkOrderRecord {
  id: string;
  orderNumber: string;
  vehicleId: string;
  isDone: boolean;
  status: string;
  completedAt?: string | null;
  completedBy?: string | null;
  notes?: string | null;
  items: WorkOrderItemRecord[];
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
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Modal mode: "EXISTING_VEHICLE" or "NEW_VEHICLE"
  const [vehicleMode, setVehicleMode] = useState<"EXISTING_VEHICLE" | "NEW_VEHICLE">("EXISTING_VEHICLE");

  // Existing Vehicle State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // Inline New Vehicle State
  const [newVehicleData, setNewVehicleData] = useState({
    vin: "",
    year: new Date().getFullYear(),
    make: "",
    model: "",
    color: "",
    currentMileage: 0,
    sourceTag: "AAW Dealer",
  });

  // Tasks & Notes for creation
  const [tasksList, setTasksList] = useState<Array<{ taskText: string; notes: string }>>([
    { taskText: "", notes: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [newItemTexts, setNewItemTexts] = useState<{ [woId: string]: string }>({});
  const [newItemNotes, setNewItemNotes] = useState<{ [woId: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  // Edit Work Order Form State
  const [editFormData, setEditFormData] = useState<{
    id: string;
    orderNumber: string;
    vehicleId: string;
    status: string;
    notes: string;
    items: Array<{ id?: string; taskText: string; notes?: string; isCompleted: boolean }>;
  } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Inline Task Note Editing on Cards
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [inlineNoteDraft, setInlineNoteDraft] = useState<string>("");
  const [savingNoteItemId, setSavingNoteItemId] = useState<string | null>(null);



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
        if (json.data.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(json.data[0].id);
        } else if (json.data.length === 0) {
          setVehicleMode("NEW_VEHICLE");
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

  const handleToggleItem = async (workOrderId: string, itemId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI Update
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        const updatedItems = wo.items.map((it) =>
          it.id === itemId ? { ...it, isCompleted: nextStatus } : it
        );
        const allDone = updatedItems.length > 0 && updatedItems.every((i) => i.isCompleted);
        return {
          ...wo,
          items: updatedItems,
          isDone: allDone,
          status: allDone ? "DONE" : "IN_PROGRESS",
        };
      })
    );

    try {
      const res = await fetch(`/api/work-orders/items/${itemId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: nextStatus, completedBy: "Technician" }),
      });
      const json = await res.json();
      if (!json.success) {
        fetchWorkOrders();
      }
    } catch (e) {
      fetchWorkOrders();
    }
  };

  const handleStartEditNote = (itemId: string, currentNote?: string | null) => {

    setEditingNoteItemId(itemId);
    setInlineNoteDraft(currentNote || "");
  };

  const handleSaveInlineNote = async (itemId: string) => {
    try {
      setSavingNoteItemId(itemId);
      const res = await fetch(`/api/work-orders/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: inlineNoteDraft.trim() || null }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingNoteItemId(null);
        setInlineNoteDraft("");
        // Optimistically update local state
        setWorkOrders((prev) =>
          prev.map((wo) => ({
            ...wo,
            items: wo.items.map((it) =>
              it.id === itemId ? { ...it, notes: inlineNoteDraft.trim() || null } : it
            ),
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNoteItemId(null);
    }
  };

  const handleAddNewItemToOrder = async (workOrderId: string) => {

    const taskText = newItemTexts[workOrderId]?.trim();
    const taskNotes = newItemNotes[workOrderId]?.trim();
    if (!taskText) return;

    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskText, notes: taskNotes || null }),
      });
      const json = await res.json();
      if (json.success) {
        setNewItemTexts((prev) => ({ ...prev, [workOrderId]: "" }));
        setNewItemNotes((prev) => ({ ...prev, [workOrderId]: "" }));
        fetchWorkOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleAddTaskField = () => {
    setTasksList([...tasksList, { taskText: "", notes: "" }]);
  };

  const handleRemoveTaskField = (index: number) => {
    setTasksList(tasksList.filter((_, i) => i !== index));
  };

  const handleTaskTextChange = (index: number, text: string) => {
    const next = [...tasksList];
    next[index] = { ...next[index], taskText: text };
    setTasksList(next);
  };

  const handleTaskNoteChange = (index: number, note: string) => {
    const next = [...tasksList];
    next[index] = { ...next[index], notes: note };
    setTasksList(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validTasks = tasksList
      .map((t) => ({ taskText: t.taskText.trim(), notes: t.notes?.trim() || null }))
      .filter((t) => t.taskText.length > 0);

    if (validTasks.length === 0) {
      setError("Please specify at least one To Do task.");
      return;
    }

    let targetVehicleId = selectedVehicleId;

    try {
      // If user chose to register a new car inline:
      if (vehicleMode === "NEW_VEHICLE") {
        if (!newVehicleData.vin || !newVehicleData.make || !newVehicleData.model || !newVehicleData.color) {
          setError("Please complete all required vehicle fields (VIN, Make, Model, Color, Year).");
          return;
        }

        const vehRes = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newVehicleData,
            year: Number(newVehicleData.year),
            currentMileage: Number(newVehicleData.currentMileage),
          }),
        });
        const vehJson = await vehRes.json();
        if (!vehJson.success) {
          setError(vehJson.error || "Failed to register new vehicle.");
          return;
        }
        targetVehicleId = vehJson.data.id;
        await fetchVehicles();
      }

      if (!targetVehicleId) {
        setError("Please select or register a vehicle.");
        return;
      }

      // Create Work Order
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: targetVehicleId,
          tasks: validTasks,
          notes,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to create work order");
        return;
      }

      // Reset modal state
      setIsOpen(false);
      setVehicleMode("EXISTING_VEHICLE");
      setTasksList([{ taskText: "", notes: "" }]);
      setNotes("");
      setNewVehicleData({
        vin: "",
        year: new Date().getFullYear(),
        make: "",
        model: "",
        color: "",
        currentMileage: 0,
        sourceTag: "AAW Dealer",
      });
      fetchWorkOrders();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  // Edit Work Order Handlers
  const handleOpenEdit = (wo: WorkOrderRecord) => {
    setEditError(null);
    setEditFormData({
      id: wo.id,
      orderNumber: wo.orderNumber,
      vehicleId: wo.vehicleId,
      status: wo.status,
      notes: wo.notes || "",
      items: wo.items.map((i) => ({
        id: i.id,
        taskText: i.taskText,
        notes: i.notes || "",
        isCompleted: i.isCompleted,
      })),
    });
    setIsEditOpen(true);
  };

  const handleEditTaskChange = (index: number, text: string) => {
    if (!editFormData) return;
    const newItems = [...editFormData.items];
    newItems[index] = { ...newItems[index], taskText: text };
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleEditTaskNoteChange = (index: number, note: string) => {
    if (!editFormData) return;
    const newItems = [...editFormData.items];
    newItems[index] = { ...newItems[index], notes: note };
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleEditTaskToggle = (index: number) => {
    if (!editFormData) return;
    const newItems = [...editFormData.items];
    newItems[index] = { ...newItems[index], isCompleted: !newItems[index].isCompleted };
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleEditAddTask = () => {
    if (!editFormData) return;
    setEditFormData({
      ...editFormData,
      items: [...editFormData.items, { taskText: "", notes: "", isCompleted: false }],
    });
  };

  const handleEditRemoveTask = (index: number) => {
    if (!editFormData) return;
    if (editFormData.items.length <= 1) {
      setEditError("A work order must have at least one task.");
      return;
    }
    const newItems = editFormData.items.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    setEditError(null);

    const validItems = editFormData.items
      .map((item) => ({
        ...item,
        taskText: item.taskText.trim(),
        notes: item.notes?.trim() || null,
      }))
      .filter((item) => item.taskText.length > 0);

    if (validItems.length === 0) {
      setEditError("Please keep at least one valid task description.");
      return;
    }

    setSavingEdit(true);


    try {
      const res = await fetch(`/api/work-orders/${editFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: editFormData.vehicleId,
          status: editFormData.status,
          notes: editFormData.notes,
          items: validItems,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setEditError(json.error || "Failed to update work order");
        return;
      }

      setIsEditOpen(false);
      setEditFormData(null);
      fetchWorkOrders();
    } catch (err: any) {
      setEditError(err.message || "An unexpected error occurred while updating.");
    } finally {
      setSavingEdit(false);
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
            <h1 className="text-2xl font-bold tracking-tight">Work Orders & Multi-Task Checklists</h1>
            <Badge variant="outline" className="text-sm font-semibold py-1 px-3 bg-muted/40">
              {doneCount}/{openCount} Cars Ready
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage individual inspection and repair tasks per vehicle order with live checkoffs & editing
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
            <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Work Order with Tasks</DialogTitle>
              </DialogHeader>
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                {/* Vehicle Selection or Inline Creation Mode Tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Vehicle Information *</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setVehicleMode("EXISTING_VEHICLE")}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-md transition-all ${
                        vehicleMode === "EXISTING_VEHICLE"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Select Existing Vehicle ({vehicles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleMode("NEW_VEHICLE")}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        vehicleMode === "NEW_VEHICLE"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" /> + Register New Vehicle
                    </button>
                  </div>

                  {vehicleMode === "EXISTING_VEHICLE" ? (
                    <div className="space-y-1 pt-1">
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={selectedVehicleId}
                        required
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                      >
                        {vehicles.length === 0 ? (
                          <option value="">No vehicles found - Please switch to Register New Vehicle</option>
                        ) : (
                          vehicles.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.year} {v.make} {v.model} ({v.color}) - {v.vin}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  ) : (
                    /* Inline New Vehicle Form */
                    <div className="p-3.5 border rounded-lg bg-card/60 space-y-3 pt-3 border-primary/30">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary pb-1 border-b border-primary/20">
                        <Car className="h-4 w-4" /> New Vehicle Details
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold">Year *</label>
                          <Input
                            type="number"
                            required
                            className="h-8 text-xs"
                            value={newVehicleData.year}
                            onChange={(e) => setNewVehicleData({ ...newVehicleData, year: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold">Color *</label>
                          <Input
                            required
                            placeholder="e.g. Gray, Black"
                            className="h-8 text-xs"
                            value={newVehicleData.color}
                            onChange={(e) => setNewVehicleData({ ...newVehicleData, color: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold">Make *</label>
                          <Input
                            required
                            placeholder="e.g. Chrysler, Jeep"
                            className="h-8 text-xs"
                            value={newVehicleData.make}
                            onChange={(e) => setNewVehicleData({ ...newVehicleData, make: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold">Model *</label>
                          <Input
                            required
                            placeholder="e.g. Pacifica, Sahara"
                            className="h-8 text-xs"
                            value={newVehicleData.model}
                            onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold">VIN (17 Characters) *</label>
                        <Input
                          required
                          placeholder="e.g. 1HGCR2F83HA123456"
                          className="h-8 text-xs font-mono"
                          value={newVehicleData.vin}
                          onChange={(e) => setNewVehicleData({ ...newVehicleData, vin: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold">Current Mileage</label>
                          <Input
                            type="number"
                            className="h-8 text-xs"
                            value={newVehicleData.currentMileage}
                            onChange={(e) => setNewVehicleData({ ...newVehicleData, currentMileage: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold">Source Tag</label>
                          <Input
                            className="h-8 text-xs"
                            value={newVehicleData.sourceTag}
                            onChange={(e) => setNewVehicleData({ ...newVehicleData, sourceTag: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* To Do Tasks Section */}
                <div className="space-y-2 pt-1 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">To Do Tasks (Multi-task checklist) *</label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddTaskField} className="h-7 text-xs text-primary">
                      <Plus className="h-3 w-3 mr-1" /> Add Another Task
                    </Button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {tasksList.map((task, idx) => (
                      <div key={idx} className="p-2 rounded-lg border bg-muted/20 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-muted-foreground w-4">{idx + 1}.</span>
                          <Input
                            required
                            placeholder={
                              idx === 0
                                ? "e.g. Take photos & upload to Deal Center"
                                : idx === 1
                                ? "e.g. Fix passenger seatbelt lock"
                                : "e.g. Detailing wash & buy fuel cap"
                            }
                            value={task.taskText}
                            onChange={(e) => handleTaskTextChange(idx, e.target.value)}
                            className="h-8 text-xs flex-1"
                          />
                          {tasksList.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={() => handleRemoveTaskField(idx)}
                              title="Remove task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="pl-6">
                          <Input
                            placeholder="Task note (optional - e.g. 'Use parts from shelf B4')..."
                            value={task.notes}
                            onChange={(e) => handleTaskNoteChange(idx, e.target.value)}
                            className="h-7 text-[11px] bg-background text-muted-foreground placeholder:text-muted-foreground/60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


                <div className="space-y-1">
                  <label className="text-xs font-semibold">Internal Shop Notes (Optional)</label>
                  <Input
                    placeholder="e.g. Customer waiting / parts on order"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Dispatch Work Order
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Work Order Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              Edit Work Order {editFormData?.orderNumber}
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
                  <label className="text-xs font-semibold">Assigned Vehicle *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={editFormData.vehicleId}
                    onChange={(e) => setEditFormData({ ...editFormData, vehicleId: e.target.value })}
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.color}) - {v.vin}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Order Status</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE (COMPLETED)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Edit Checklist Tasks *</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEditAddTask}
                    className="h-7 text-xs text-primary"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Task
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {editFormData.items.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg border bg-card/70 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditTaskToggle(idx)}
                          className="p-1 text-muted-foreground hover:text-foreground shrink-0"
                          title={item.isCompleted ? "Mark incomplete" : "Mark completed"}
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>

                        <Input
                          required
                          value={item.taskText}
                          onChange={(e) => handleEditTaskChange(idx, e.target.value)}
                          className={`h-8 text-xs flex-1 ${item.isCompleted ? "line-through opacity-70" : ""}`}
                          placeholder="Task description..."
                        />

                        {editFormData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => handleEditRemoveTask(idx)}
                            title="Remove this task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="pl-7">
                        <Input
                          placeholder="Task note (optional)..."
                          value={item.notes || ""}
                          onChange={(e) => handleEditTaskNoteChange(idx, e.target.value)}
                          className="h-7 text-[11px] bg-muted/30 text-muted-foreground placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              <div className="space-y-1">
                <label className="text-xs font-semibold">Internal Shop Notes</label>
                <Input
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Notes, waiting on parts, etc."
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                {vehicleMap.get(editFormData.vehicleId) && (
                  <Link
                    href={`/vehicles?search=${encodeURIComponent(vehicleMap.get(editFormData.vehicleId)!.vin)}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    onClick={() => setIsEditOpen(false)}
                  >
                    <Car className="h-3.5 w-3.5" /> Edit Vehicle Record
                  </Link>
                )}

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

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search work orders by Task keyword, VIN, or Order Number..."
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
            Ready / Done (✓)
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading work orders...</div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
          No work orders found. Create your first vehicle order above.
        </div>
      ) : (
        <div className="grid gap-4">
          {workOrders.map((wo) => {
            const veh = vehicleMap.get(wo.vehicleId);
            const completedCount = wo.items.filter((i) => i.isCompleted).length;
            const totalCount = wo.items.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <Card
                key={wo.id}
                className={`transition-all border-l-4 ${
                  wo.isDone ? "border-l-emerald-500 bg-muted/10 opacity-90" : "border-l-amber-500 hover:shadow-md"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          className="font-mono font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded cursor-pointer hover:bg-primary/20 transition-colors border-none"
                          onClick={() => handleOpenEdit(wo)}
                          title="Click to edit work order"
                        >
                          {wo.orderNumber}
                        </button>

                        {veh ? (
                          <Link
                            href={`/vehicles?search=${encodeURIComponent(veh.vin)}`}
                            className="font-semibold text-base hover:text-primary hover:underline flex items-center gap-1.5"
                            title="Click to view/edit this vehicle in inventory"
                          >
                            <span>{veh.year} {veh.make} {veh.model}</span>
                            <span className="text-xs font-normal text-muted-foreground">({veh.color})</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Link>
                        ) : (
                          <span className="font-semibold text-base">Unknown Vehicle</span>
                        )}

                        <span className="text-xs font-mono text-muted-foreground">
                          VIN: {veh?.vin || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs flex items-center gap-1 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleOpenEdit(wo)}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>

                      <Badge variant={wo.isDone ? "success" : "warning"} className="text-xs">
                        {wo.isDone ? "ALL TASKS DONE" : `${completedCount}/${totalCount} TASKS DONE (${progressPercent}%)`}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(wo.createdAt)}</span>
                    </div>
                  </div>

                  {/* Tasks Checklist */}
                  <div className="mt-3.5 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Checklist Tasks (Click checkbox to complete):
                    </div>

                    <div className="grid gap-2">
                      {wo.items.map((item) => {
                        const isEditingThisNote = editingNoteItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            role="button"
                            tabIndex={isEditingThisNote ? -1 : 0}
                            onClick={() => {
                              if (!isEditingThisNote) {
                                handleToggleItem(wo.id, item.id, item.isCompleted);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (!isEditingThisNote && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                handleToggleItem(wo.id, item.id, item.isCompleted);
                              }
                            }}
                            className={`flex flex-col p-2.5 rounded-lg border transition-colors ${
                              isEditingThisNote
                                ? "bg-card border-primary ring-1 ring-primary shadow-sm"
                                : item.isCompleted
                                ? "bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 cursor-pointer"
                                : "bg-card hover:bg-muted/50 border-border cursor-pointer"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="mt-0.5 shrink-0">
                                  {item.isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 text-sm font-medium leading-tight">
                                  <span className={item.isCompleted ? "line-through opacity-70" : ""}>
                                    {item.taskText}
                                  </span>

                                  {/* Note Display (when not currently editing this item) */}
                                  {!isEditingThisNote && item.notes && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditNote(item.id, item.notes);
                                      }}
                                      className="mt-1.5 flex items-start gap-1.5 text-xs font-normal text-amber-900 dark:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-md px-2 py-1 border border-amber-500/20 transition-colors cursor-pointer group text-left border-none w-auto"
                                      title="Click to edit task note"
                                    >
                                      <StickyNote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                      <span className="italic flex-1">{item.notes}</span>
                                      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground ml-1 shrink-0 transition-opacity" />
                                    </button>
                                  )}

                                  {item.completedAt && (
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                      Completed on {formatDate(item.completedAt)}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right side + Note Button (when not editing) */}
                              {!isEditingThisNote && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center gap-1 shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditNote(item.id, item.notes || "");
                                  }}
                                  title={item.notes ? "Edit note" : "Add note to this task"}
                                >
                                  <StickyNote className="h-3 w-3" />
                                  <span>{item.notes ? "Edit Note" : "+ Note"}</span>
                                </Button>
                              )}
                            </div>

                            {/* Inline Note Editor */}
                            {isEditingThisNote && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="mt-2.5 pt-2 border-t space-y-2"
                              >
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                                  <StickyNote className="h-3.5 w-3.5" />
                                  <span>Task Note:</span>
                                </div>
                                <Input
                                  autoFocus
                                  placeholder="Type note for this task (e.g. 'Installed part #102', 'Needs alignment')..."
                                  value={inlineNoteDraft}
                                  onChange={(e) => setInlineNoteDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveInlineNote(item.id);
                                    } else if (e.key === "Escape") {
                                      setEditingNoteItemId(null);
                                    }
                                  }}
                                  className="h-7 text-xs bg-muted/20"
                                />
                                <div className="flex items-center justify-end gap-1.5 pt-0.5">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => setEditingNoteItemId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-6 px-2.5 text-xs gap-1"
                                    disabled={savingNoteItemId === item.id}
                                    onClick={() => handleSaveInlineNote(item.id)}
                                  >
                                    <Check className="h-3 w-3" />
                                    {savingNoteItemId === item.id ? "Saving..." : "Save Note"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>


                    {/* Quick Add Task to Existing Order */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add another task to this car (e.g. 'Fix passenger mirror')..."
                          value={newItemTexts[wo.id] || ""}
                          onChange={(e) => setNewItemTexts({ ...newItemTexts, [wo.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddNewItemToOrder(wo.id);
                            }
                          }}
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs shrink-0"
                          onClick={() => handleAddNewItemToOrder(wo.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Task
                        </Button>
                      </div>
                      {newItemTexts[wo.id] && (
                        <Input
                          placeholder="Task note (optional)..."
                          value={newItemNotes[wo.id] || ""}
                          onChange={(e) => setNewItemNotes({ ...newItemNotes, [wo.id]: e.target.value })}
                          className="h-7 text-[11px] bg-muted/30 text-muted-foreground placeholder:text-muted-foreground/60"
                        />
                      )}
                    </div>


                    {wo.notes && (
                      <div className="text-xs text-muted-foreground italic pt-1">
                        Notes: {wo.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
