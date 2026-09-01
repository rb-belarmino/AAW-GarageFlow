import { PrismaWorkOrderRepository } from "@/infrastructure/database/repositories/PrismaWorkOrderRepository";
import { UpdateWorkOrderItemUseCase } from "@/core/use-cases/work-order/UpdateWorkOrderItemUseCase";
import { InMemoryWorkOrderRepository } from "../../harness/garage-flow-harness.test";
import { WorkOrder } from "@/core/domain/entities/WorkOrder";

describe("Task Notes Persistence Verification", () => {
  let workOrderRepo: InMemoryWorkOrderRepository;
  let updateWorkOrderItemUseCase: UpdateWorkOrderItemUseCase;

  beforeEach(() => {
    workOrderRepo = new InMemoryWorkOrderRepository();
    updateWorkOrderItemUseCase = new UpdateWorkOrderItemUseCase(workOrderRepo);
  });

  it("should create work order with task notes and retrieve them correctly", async () => {
    const wo = new WorkOrder({
      vehicleId: "veh-123",
      items: [
        { taskText: "Replace Brake Pads", notes: "Use Ceramic Brembo pads" },
        { taskText: "Flush Brake Fluid", notes: "DOT 4 High Temp" },
      ],
      notes: "Customer reported squeaking noise",
    });

    const saved = await workOrderRepo.create(wo);
    expect(saved.notes).toBe("Customer reported squeaking noise");
    expect(saved.items[0].notes).toBe("Use Ceramic Brembo pads");
    expect(saved.items[1].notes).toBe("DOT 4 High Temp");
  });

  it("should update a single task item note via inline edit use case", async () => {
    const wo = new WorkOrder({
      vehicleId: "veh-123",
      items: [
        { taskText: "Tire Rotation", notes: null },
      ],
    });

    const saved = await workOrderRepo.create(wo);
    const itemId = saved.items[0].id;

    const updatedItem = await updateWorkOrderItemUseCase.execute({
      itemId,
      notes: "Front right tire has 4mm tread left",
    });

    expect(updatedItem.notes).toBe("Front right tire has 4mm tread left");
  });
});
