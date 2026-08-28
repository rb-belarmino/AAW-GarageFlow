import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting and seeding inventory from 'Dealer cars _ to do.xlsx'...");

  // Clean existing records to allow fresh multi-item seed
  await prisma.workOrderItem.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.vehicle.deleteMany();

  const spreadsheetRows = [
    {
      vehicle: {
        vin: "KMHGN4JE3JU100001",
        year: 2018,
        make: "Genesis",
        model: "G80 Sedan",
        color: "Black",
        currentMileage: 42000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1001",
        notes: "Genesis yard intake",
        tasks: [
          "Take photos & upload at Deal Center",
          "Cinto do carona nao trava (Fix passenger seatbelt lock)",
          "Teto solar as vezes nao fecha (Service sunroof mechanism)",
          "Camera de ré em azul (Diagnose blue backup camera screen)",
        ],
      },
    },
    {
      vehicle: {
        vin: "2C4RC1CG5HR100002",
        year: 2017,
        make: "Chrysler",
        model: "Pacifica",
        color: "Gray",
        currentMileage: 68500,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1002",
        notes: "Pacifica prep",
        tasks: [
          "Take photos & upload at Deal Center",
          "Detailing clean",
          "Buy & install Fuel cap",
        ],
      },
    },
    {
      vehicle: {
        vin: "3GNAXKEV8NL100003",
        year: 2022,
        make: "Chevrolet",
        model: "Equinox",
        color: "White",
        currentMileage: 28000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1003",
        notes: "Electrical check",
        tasks: [
          "Multimedia screen is not working properly / diagnose electrical head unit",
        ],
      },
    },
    {
      vehicle: {
        vin: "3KPF24AD8HE100004",
        year: 2017,
        make: "Kia",
        model: "Forte",
        color: "Silver",
        currentMileage: 54000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1004",
        notes: "Drive belt & media",
        tasks: [
          "Upload on Deal Center",
          "Take photos",
          "Change drive belt (Serpentine)",
        ],
      },
    },
    {
      vehicle: {
        vin: "5YJSA1E15DF100005",
        year: 2013,
        make: "Tesla",
        model: "Model S",
        color: "Midnight Silver",
        currentMileage: 89000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1005",
        notes: "Tesla repairs",
        tasks: [
          "Air conditioner service",
          "Front right headlight repair",
          "Middle touch screen not working diagnosis",
        ],
      },
    },
    {
      vehicle: {
        vin: "KNDJP3A56F7100006",
        year: 2015,
        make: "Kia",
        model: "Soul",
        color: "Yellow",
        currentMileage: 61000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1006",
        notes: "Ready for sale",
        isDone: true,
        tasks: [
          "OK - Intake inspection",
          "OK - Detailing & prep",
        ],
      },
    },
    {
      vehicle: {
        vin: "1C4HJWEG2CL100007",
        year: 2012,
        make: "Jeep",
        model: "Wrangler SAHARA",
        color: "Tank Green",
        currentMileage: 95000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1007",
        notes: "Engine scan",
        tasks: [
          "Checking engine light - Run OBD2 scan & oxygen sensor diagnosis",
        ],
      },
    },
    {
      vehicle: {
        vin: "KMHD84LF7LU100008",
        year: 2020,
        make: "Hyundai",
        model: "Elantra",
        color: "Black",
        currentMileage: 39000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1008",
        notes: "Battery replacement",
        tasks: [
          "Trocar bateria (Replace 12V Battery & test alternator charging)",
        ],
      },
    },
    {
      vehicle: {
        vin: "SALVT2V48FH100009",
        year: 2015,
        make: "Land Rover",
        model: "Range Rover Evoque",
        color: "Fuji White",
        currentMileage: 72000,
        sourceTag: "AAW Dealer",
      },
      workOrder: {
        orderNumber: "WO-1009",
        notes: "Drivetrain service",
        tasks: [
          "4x4 transfer case service & differential fluid inspection",
        ],
      },
    },
  ];

  for (const row of spreadsheetRows) {
    const createdVehicle = await prisma.vehicle.create({
      data: row.vehicle,
    });

    const isDone = row.workOrder.isDone || false;
    await prisma.workOrder.create({
      data: {
        orderNumber: row.workOrder.orderNumber,
        vehicleId: createdVehicle.id,
        notes: row.workOrder.notes,
        isDone,
        status: isDone ? "DONE" : "IN_PROGRESS",
        completedAt: isDone ? new Date() : null,
        items: {
          create: row.workOrder.tasks.map((taskText, idx) => ({
            taskText,
            orderIndex: idx,
            isCompleted: isDone,
            completedAt: isDone ? new Date() : null,
          })),
        },
      },
    });
    console.log(`✓ Seeded: ${createdVehicle.year} ${createdVehicle.make} ${createdVehicle.model} with ${row.workOrder.tasks.length} tasks`);
  }

  console.log("Seeding complete! All 9 spreadsheet vehicles and itemized checklists initialized successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
