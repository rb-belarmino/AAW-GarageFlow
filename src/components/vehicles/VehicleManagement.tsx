'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import {
  Plus,
  Search,
  Car,
  AlertCircle,
  Pencil,
  Wrench,
  Sparkles,
  Loader2,
  Check,
  Camera,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { formatMileage, formatDate } from '@/lib/utils'
import { BarcodeScannerModal } from './BarcodeScannerModal'

export interface VehicleRecord {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim?: string | null
  color: string
  licensePlate?: string | null
  currentMileage: number
  sourceTag: string
  status: string
  createdAt: string
}

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isScanningForEdit, setIsScanningForEdit] = useState(false)

  // VIN Decoder States
  const [decodingVin, setDecodingVin] = useState(false)
  const [decodingEditVin, setDecodingEditVin] = useState(false)
  const [decodedSuccessMsg, setDecodedSuccessMsg] = useState<string | null>(
    null
  )
  const [decodedEditSuccessMsg, setDecodedEditSuccessMsg] = useState<
    string | null
  >(null)

  // New Vehicle form state
  const [formData, setFormData] = useState({
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    trim: '',
    color: '',
    licensePlate: '',
    currentMileage: 0,
    sourceTag: 'AAW Dealer'
  })

  // Edit Vehicle form state
  const [editFormData, setEditFormData] = useState<{
    id: string
    vin: string
    year: number
    make: string
    model: string
    trim: string
    color: string
    licensePlate: string
    currentMileage: number
    sourceTag: string
    status: string
  } | null>(null)

  const { data: session } = useSession()
  const canDelete =
    session?.user?.role === 'MANAGER' || session?.user?.role === 'ADMIN'

  const [error, setError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete vehicle modal state
  const [deletingVehicle, setDeletingVehicle] = useState<VehicleRecord | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const url = search
        ? `/api/vehicles?search=${encodeURIComponent(search)}`
        : `/api/vehicles`
      const res = await fetch(url)

      const json = await res.json()
      if (json.success) {
        setVehicles(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [search])

  // Decode VIN from government NHTSA API
  const handleDecodeVin = async (
    isEdit: boolean = false,
    overrideVin?: string
  ) => {
    const targetVin = overrideVin || (isEdit ? editFormData?.vin : formData.vin)
    if (!targetVin || targetVin.trim().length !== 17) {
      if (isEdit)
        setEditError('Please enter a full 17-character VIN first to decode.')
      else setError('Please enter a full 17-character VIN first to decode.')
      return
    }

    if (isEdit) {
      setDecodingEditVin(true)
      setEditError(null)
      setDecodedEditSuccessMsg(null)
    } else {
      setDecodingVin(true)
      setError(null)
      setDecodedSuccessMsg(null)
    }

    try {
      const res = await fetch(
        `/api/vehicles/decode-vin?vin=${encodeURIComponent(targetVin.trim())}`
      )
      const json = await res.json()

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Could not decode VIN information.')
      }

      const info = json.data

      if (isEdit && editFormData) {
        setEditFormData(prev =>
          prev
            ? {
                ...prev,
                vin: targetVin.trim().toUpperCase(),
                year: info.year || prev.year,
                make: info.make || prev.make,
                model: info.model || prev.model,
                trim: info.trim || prev.trim
              }
            : null
        )
        setDecodedEditSuccessMsg(
          `✓ Decoded: ${info.year} ${info.make} ${info.model} ${info.trim ? `(${info.trim})` : ''}`
        )
      } else {
        setFormData(prev => ({
          ...prev,
          vin: targetVin.trim().toUpperCase(),
          year: info.year || prev.year,
          make: info.make || prev.make,
          model: info.model || prev.model,
          trim: info.trim || prev.trim
        }))
        setDecodedSuccessMsg(
          `✓ Decoded: ${info.year} ${info.make} ${info.model} ${info.trim ? `(${info.trim})` : ''}`
        )
      }
    } catch (err: any) {
      if (isEdit) setEditError(err.message || 'Failed to decode VIN.')
      else setError(err.message || 'Failed to decode VIN.')
    } finally {
      if (isEdit) setDecodingEditVin(false)
      else setDecodingVin(false)
    }
  }

  // When barcode scanner detects a VIN
  const handleBarcodeDetected = (scannedVin: string) => {
    if (isScanningForEdit) {
      if (editFormData) {
        setEditFormData({
          ...editFormData,
          vin: scannedVin
        })
      }
      handleDecodeVin(true, scannedVin)
    } else {
      setFormData(prev => ({
        ...prev,
        vin: scannedVin
      }))
      handleDecodeVin(false, scannedVin)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          color: formData.color.trim() || null,
          year: Number(formData.year),
          currentMileage: Number(formData.currentMileage)
        })
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Failed to create vehicle')
        return
      }
      setIsOpen(false)
      setDecodedSuccessMsg(null)
      setFormData({
        vin: '',
        year: new Date().getFullYear(),
        make: '',
        model: '',
        trim: '',
        color: '',
        licensePlate: '',
        currentMileage: 0,
        sourceTag: 'AAW Dealer'
      })
      fetchVehicles()
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    }
  }

  const handleOpenEdit = (veh: VehicleRecord) => {
    setEditError(null)
    setDecodedEditSuccessMsg(null)
    setEditFormData({
      id: veh.id,
      vin: veh.vin,
      year: veh.year,
      make: veh.make,
      model: veh.model,
      trim: veh.trim || '',
      color: veh.color || '',
      licensePlate: veh.licensePlate || '',
      currentMileage: veh.currentMileage,
      sourceTag: veh.sourceTag,
      status: veh.status
    })
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData) return
    setEditError(null)
    setSavingEdit(true)

    try {
      const res = await fetch(`/api/vehicles/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: editFormData.vin,
          year: Number(editFormData.year),
          make: editFormData.make,
          model: editFormData.model,
          trim: editFormData.trim || null,
          color: editFormData.color?.trim() || null,
          licensePlate: editFormData.licensePlate || null,
          currentMileage: Number(editFormData.currentMileage),
          sourceTag: editFormData.sourceTag,
          status: editFormData.status
        })
      })
      const json = await res.json()
      if (!json.success) {
        setEditError(json.error || 'Failed to update vehicle')
        return
      }
      setIsEditOpen(false)
      setEditFormData(null)
      fetchVehicles()
    } catch (err: any) {
      setEditError(
        err.message || 'An unexpected error occurred while updating.'
      )
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return
    try {
      setIsDeleting(true)
      setDeleteError(null)
      const res = await fetch(`/api/vehicles/${deletingVehicle.id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete vehicle.')
      }
      setDeletingVehicle(null)
      fetchVehicles()
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete vehicle.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vehicles Inventory
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage dealership units, mileage records, Barcode Scanner, VIN
            auto-decoding (NHTSA API), and quick edit
          </p>
        </div>

        {/* Add Vehicle Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Register New Vehicle
              </DialogTitle>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {decodedSuccessMsg && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2.5 text-xs text-emerald-600 font-medium">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{decodedSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* VIN Input with Scan & Auto-Decode Buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">
                    VIN (17 Characters) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsScanningForEdit(false)
                        setIsScannerOpen(true)
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <Camera className="h-3 w-3" />
                      Scan Barcode
                    </button>
                    <span className="text-muted-foreground text-xs">•</span>
                    <button
                      type="button"
                      onClick={() => handleDecodeVin(false)}
                      disabled={decodingVin || formData.vin.length < 17}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
                    >
                      {decodingVin ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Decoding...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Auto-fill
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    required
                    maxLength={17}
                    placeholder="e.g. 2HGFE2F53PH518377"
                    className="font-mono text-xs uppercase"
                    value={formData.vin}
                    onChange={e => {
                      const val = e.target.value.toUpperCase()
                      setFormData({ ...formData, vin: val })
                      if (val.length === 17 && !formData.make) {
                        setTimeout(() => handleDecodeVin(false), 200)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsScanningForEdit(false)
                      setIsScannerOpen(true)
                    }}
                    className="shrink-0 text-xs px-2.5 h-9"
                    title="Scan VIN barcode using camera or photo"
                  >
                    <Camera className="h-3.5 w-3.5 text-primary mr-1" />
                    Scan
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Year *</label>
                  <Input
                    type="number"
                    required
                    value={formData.year}
                    onChange={e =>
                      setFormData({ ...formData, year: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">
                    Color (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Aegean Blue, Black"
                    value={formData.color}
                    onChange={e =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Make *</label>
                  <Input
                    required
                    placeholder="e.g. Honda, Toyota"
                    value={formData.make}
                    onChange={e =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Model *</label>
                  <Input
                    required
                    placeholder="e.g. Civic, RAV4"
                    value={formData.model}
                    onChange={e =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Trim</label>
                  <Input
                    placeholder="e.g. Sport, EX-L, Touring"
                    value={formData.trim}
                    onChange={e =>
                      setFormData({ ...formData, trim: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">License Plate</label>
                  <Input
                    placeholder="e.g. 7XYZ123"
                    value={formData.licensePlate}
                    onChange={e =>
                      setFormData({ ...formData, licensePlate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">
                    Current Mileage
                  </label>
                  <Input
                    type="number"
                    value={formData.currentMileage}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        currentMileage: Number(e.target.value)
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Source Tag</label>
                  <Input
                    value={formData.sourceTag}
                    onChange={e =>
                      setFormData({ ...formData, sourceTag: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
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
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {decodedEditSuccessMsg && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2.5 text-xs text-emerald-600 font-medium">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{decodedEditSuccessMsg}</span>
              </div>
            )}

            {editFormData && (
              <form onSubmit={handleEditSubmit} className="space-y-4 pt-1">
                {/* VIN with Scan & Decode Button in Edit Modal */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold">
                      VIN (17 Characters) *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsScanningForEdit(true)
                          setIsScannerOpen(true)
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Camera className="h-3 w-3" />
                        Scan Barcode
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        type="button"
                        onClick={() => handleDecodeVin(true)}
                        disabled={
                          decodingEditVin || editFormData.vin.length < 17
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
                      >
                        {decodingEditVin ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Decoding...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            Auto-fill
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      required
                      maxLength={17}
                      placeholder="e.g. 1HGCR2F83HA123456"
                      className="font-mono text-xs uppercase"
                      value={editFormData.vin}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          vin: e.target.value.toUpperCase()
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsScanningForEdit(true)
                        setIsScannerOpen(true)
                      }}
                      className="shrink-0 text-xs px-2.5 h-9"
                    >
                      <Camera className="h-3.5 w-3.5 text-primary mr-1" />
                      Scan
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Year *</label>
                    <Input
                      type="number"
                      required
                      value={editFormData.year}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          year: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">
                      Color (Optional)
                    </label>
                    <Input
                      placeholder="e.g. Gray, Black"
                      value={editFormData.color}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          color: e.target.value
                        })
                      }
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
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          make: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Model *</label>
                    <Input
                      required
                      placeholder="e.g. Pacifica, Sahara"
                      value={editFormData.model}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          model: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Trim</label>
                    <Input
                      placeholder="e.g. Touring L, Limited"
                      value={editFormData.trim}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          trim: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">
                      License Plate
                    </label>
                    <Input
                      placeholder="e.g. 7XYZ123"
                      value={editFormData.licensePlate}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          licensePlate: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold">Mileage</label>
                    <Input
                      type="number"
                      value={editFormData.currentMileage}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          currentMileage: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold">Source Tag</label>
                    <Input
                      value={editFormData.sourceTag}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          sourceTag: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold">Status</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={editFormData.status}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value
                        })
                      }
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={savingEdit}>
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVinDetected={handleBarcodeDetected}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles by VIN, make, model, or color..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
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
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading vehicle inventory...
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No vehicles found. Add your first dealership vehicle above.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map(veh => (
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
                      {veh.color && veh.color !== 'Unspecified' && (
                        <span className="text-xs text-muted-foreground">
                          ({veh.color})
                        </span>
                      )}
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
                    <Badge
                      variant={
                        veh.status === 'ACTIVE' ? 'success' : 'secondary'
                      }
                    >
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
                      <Link
                        href={`/work-orders?search=${encodeURIComponent(veh.vin)}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          title="View work orders for this car"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs flex items-center gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          title="Delete vehicle (Manager/Admin only)"
                          onClick={() => {
                            setDeleteError(null)
                            setDeletingVehicle(veh)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Vehicle Confirmation Dialog (Manager / Admin Only) */}
      <Dialog
        open={Boolean(deletingVehicle)}
        onOpenChange={open => {
          if (!open) {
            setDeletingVehicle(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Vehicle
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm text-foreground">
            <p>
              Are you sure you want to permanently delete this vehicle from the
              inventory?
            </p>
            {deletingVehicle && (
              <div className="rounded-lg border bg-muted/50 p-3 text-xs space-y-1 font-mono">
                <div>
                  <strong>Vehicle:</strong> {deletingVehicle.year}{' '}
                  {deletingVehicle.make} {deletingVehicle.model}{' '}
                  {deletingVehicle.trim || ''}
                </div>
                <div>
                  <strong>VIN:</strong> {deletingVehicle.vin}
                </div>
                <div>
                  <strong>Tag:</strong> {deletingVehicle.sourceTag}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              ⚠️ This will permanently remove the vehicle record and all
              associated work orders. This action cannot be undone.
            </p>

            {deleteError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                setDeletingVehicle(null)
                setDeleteError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              className="gap-1.5"
              onClick={handleDeleteVehicle}
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
