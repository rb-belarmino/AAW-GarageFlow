import { GET as getVehicles, POST as postVehicle } from "@/app/api/vehicles/route";
import { GET as getVehicleById, PUT as putVehicleById } from "@/app/api/vehicles/[id]/route";
import { GET as getWorkOrders, POST as postWorkOrder } from "@/app/api/work-orders/route";
import { GET as getWorkOrderById, PUT as putWorkOrderById } from "@/app/api/work-orders/[id]/route";
import { POST as postWorkOrderItem } from "@/app/api/work-orders/[id]/items/route";
import { PATCH as patchToggleWorkOrderDone } from "@/app/api/work-orders/[id]/toggle-done/route";
import { PATCH as patchToggleWorkOrderItem } from "@/app/api/work-orders/items/[itemId]/toggle/route";
import { GET as getDashboard } from "@/app/api/dashboard/route";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

describe("Security Harness: API Route Protection & Authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Unauthenticated Access Restrictions (401 Unauthorized)", () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
    });

    it("blocks unauthenticated GET /api/vehicles", async () => {
      const req = new Request("http://localhost:3000/api/vehicles");
      const res = await getVehicles(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("blocks unauthenticated POST /api/vehicles", async () => {
      const req = new Request("http://localhost:3000/api/vehicles", {
        method: "POST",
        body: JSON.stringify({ vin: "1HGCR2F83HA000000", year: 2020, make: "Honda", model: "Accord" }),
      });
      const res = await postVehicle(req);
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated GET /api/vehicles/[id]", async () => {
      const req = new Request("http://localhost:3000/api/vehicles/123");
      const res = await getVehicleById(req, { params: Promise.resolve({ id: "123" }) });
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated PUT /api/vehicles/[id]", async () => {
      const req = new Request("http://localhost:3000/api/vehicles/123", {
        method: "PUT",
        body: JSON.stringify({ color: "Red" }),
      });
      const res = await putVehicleById(req, { params: Promise.resolve({ id: "123" }) });
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated GET /api/work-orders", async () => {
      const req = new Request("http://localhost:3000/api/work-orders");
      const res = await getWorkOrders(req);
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated POST /api/work-orders", async () => {
      const req = new Request("http://localhost:3000/api/work-orders", {
        method: "POST",
        body: JSON.stringify({ vehicleId: "v-1" }),
      });
      const res = await postWorkOrder(req);
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated GET /api/work-orders/[id]", async () => {
      const req = new Request("http://localhost:3000/api/work-orders/wo-1");
      const res = await getWorkOrderById(req, { params: Promise.resolve({ id: "wo-1" }) });
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated PUT /api/work-orders/[id]", async () => {
      const req = new Request("http://localhost:3000/api/work-orders/wo-1", {
        method: "PUT",
        body: JSON.stringify({ notes: "Malicious update" }),
      });
      const res = await putWorkOrderById(req, { params: Promise.resolve({ id: "wo-1" }) });
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated POST /api/work-orders/[id]/items", async () => {
      const req = new Request("http://localhost:3000/api/work-orders/wo-1/items", {
        method: "POST",
        body: JSON.stringify({ taskText: "Unauth Task" }),
      });
      const res = await postWorkOrderItem(req, { params: Promise.resolve({ id: "wo-1" }) });
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated PATCH /api/work-orders/[id]/toggle-done", async () => {
      const req = new Request("http://localhost:3000/api/work-orders/wo-1/toggle-done", {
        method: "PATCH",
        body: JSON.stringify({ isDone: true }),
      });
      const res = await patchToggleWorkOrderDone(req, { params: Promise.resolve({ id: "wo-1" }) });
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated PATCH /api/work-orders/items/[itemId]/toggle", async () => {
      const req = new Request("http://localhost:3000/api/work-orders/items/item-1/toggle", {
        method: "PATCH",
        body: JSON.stringify({ isCompleted: true }),
      });
      const res = await patchToggleWorkOrderItem(req, { params: Promise.resolve({ itemId: "item-1" }) });
      expect(res.status).toBe(401);
    });

    it("blocks unauthenticated GET /api/dashboard", async () => {
      const res = await getDashboard();
      expect(res.status).toBe(401);
    });
  });
});
