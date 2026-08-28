# API & Server Action Contracts: AAW GarageFlow

## 1. Work Orders Service API

### `POST /api/work-orders` (or `createWorkOrderAction`)
**Description**: Creates a new work order for a vehicle with free-form To Do text.

**Request Payload:**
```json
{
  "vehicleId": "uuid-string",
  "toDoText": "take photos / upload at Deal center: detailing clean - Buy Fuel cap",
  "notes": "Urgent turnaround requested by dealer"
}
```

**Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "wo-uuid",
    "orderNumber": "WO-1001",
    "vehicleId": "uuid-string",
    "toDoText": "take photos / upload at Deal center: detailing clean - Buy Fuel cap",
    "isDone": false,
    "status": "IN_PROGRESS",
    "createdAt": "2026-08-28T18:00:00.000Z",
    "completedAt": null
  }
}
```

---

### `PATCH /api/work-orders/:id/toggle-done` (or `toggleWorkOrderDoneAction`)
**Description**: Toggles the Done state (✓) of a work order in real time.

**Request Payload:**
```json
{
  "isDone": true,
  "completedBy": "John Doe (Technician)"
}
```

**Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "wo-uuid",
    "orderNumber": "WO-1001",
    "isDone": true,
    "status": "DONE",
    "completedAt": "2026-08-28T18:30:00.000Z",
    "completedBy": "John Doe (Technician)"
  }
}
```

---

## 2. Vehicles Service API

### `POST /api/vehicles` (or `createVehicleAction`)
**Description**: Registers a new vehicle in the fleet inventory.

**Request Payload:**
```json
{
  "vin": "1HGCR2F83HA123456",
  "year": 2017,
  "make": "Chrysler",
  "model": "Pacifica",
  "color": "Gray",
  "licensePlate": "7XYZ89",
  "currentMileage": 45200,
  "sourceTag": "AAW Dealer"
}
```

**Response Payload (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "veh-uuid",
    "vin": "1HGCR2F83HA123456",
    "year": 2017,
    "make": "Chrysler",
    "model": "Pacifica",
    "color": "Gray",
    "currentMileage": 45200,
    "sourceTag": "AAW Dealer",
    "status": "ACTIVE"
  }
}
```

---

## 3. Recurring Maintenance Service API

### `POST /api/schedules/evaluate` (or `evaluateMaintenanceSchedulesAction`)
**Description**: Runs schedule evaluation across all active vehicles, auto-dispatching work orders for due maintenance.

**Response Payload (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluatedCount": 15,
    "dispatchedCount": 2,
    "dispatchedOrders": [
      {
        "workOrderId": "wo-uuid-2",
        "vehicleVin": "1HGCR2F83HA123456",
        "serviceName": "Oil & Filter Change",
        "toDoText": "Recurring Maintenance: Oil & Filter Change (Threshold reached at 50,000 miles)"
      }
    ]
  }
}
```
