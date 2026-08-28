import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding legacy spreadsheet inventory from 'Dealer cars _ to do.xlsx'...");

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
        toDoText: "take photos / upload at Deal center / Cinto do carona nao trava - Teto solar as vezes nao fecha - camera de ré em azul",
        isDone: false,
        status: "IN_PROGRESS" as const,
      },
      schedule: {
        serviceName: "Synthetic Oil & Multi-Point Inspection",
        defaultToDoText: "Change synthetic oil, replace filter, check seatbelt lock and sunroof mechanism",
        intervalMonths: 6,
        intervalMiles: 5000,
      }
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
        toDoText: "take photos / upload at Deal center: detailing clean - Buy Fuel cap",
        isDone: false,
        status: "IN_PROGRESS" as const,
      },
      schedule: {
        serviceName: "Fuel System & Filter Inspection",
        defaultToDoText: "Inspect fuel cap seal, replace cabin air filter, full vehicle detailing",
        intervalMonths: 12,
        intervalMiles: 10000,
      }
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
        toDoText: "multimedia screen is not working properly /? diagnose electrical head unit",
        isDone: false,
        status: "IN_PROGRESS" as const,
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
        toDoText: "Upload on Deal center / take photos / change drive belt",
        isDone: false,
        status: "IN_PROGRESS" as const,
      },
      schedule: {
        serviceName: "Serpentine & Drive Belt Inspection",
        defaultToDoText: "Inspect drive belt tension and replace worn serpentine belt",
        intervalMonths: 24,
        intervalMiles: 30000,
      }
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
        toDoText: "Ar conditioner / front right light / Middle screen not working",
        isDone: false,
        status: "IN_PROGRESS" as const,
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
        toDoText: "OK - All initial repairs and prep completed",
        isDone: true,
        status: "DONE" as const,
        completedAt: new Date(),
        completedBy: "Lead Prep Tech",
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
        toDoText: "Checking engine light - Run OBD2 scan & oxygen sensor diagnosis",
        isDone: false,
        status: "IN_PROGRESS" as const,
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
        toDoText: "trocar bateria (Replace 12V AGM Battery & test alternator charging)",
        isDone: false,
        status: "IN_PROGRESS" as const,
      },
      schedule: {
        serviceName: "Battery & Electrical Charging System Test",
        defaultToDoText: "Test CCA, clean terminals, inspect alternator voltage",
        intervalMonths: 12,
        intervalMiles: 15000,
      }
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
        toDoText: "4x4 transfer case service & differential fluid inspection",
        isDone: false,
        status: "IN_PROGRESS" as const,
      },
    },
  ];

  for (const row of spreadsheetRows) {
    const existing = await prisma.vehicle.findUnique({
      where: { vin: row.vehicle.vin },
    });

    let vehicleId = existing?.id;
    if (!existing) {
      const created = await prisma.vehicle.create({
        data: row.vehicle,
      });
      vehicleId = created.id;
      console.log(`Created vehicle: ${created.year} ${created.make} ${created.model} (${created.vin})`);
    }

    if (vehicleId) {
      const existingWO = await prisma.workOrder.findUnique({
        where: { orderNumber: row.workOrder.orderNumber },
      });
      if (!existingWO) {
        await prisma.workOrder.create({
          data: {
            ...row.workOrder,
            vehicleId,
          },
        });
        console.log(`Created work order: ${row.workOrder.orderNumber} for vehicle ${row.vehicle.model}`);
      }

      if (row.schedule) {
        const nextDueDate = new Date();
        nextDueDate.setMonth(nextDueDate.getMonth() + (row.schedule.intervalMonths || 6));
        const nextDueMileage = row.vehicle.currentMileage + (row.schedule.intervalMiles || 5000);

        await prisma.maintenanceSchedule.create({
          data: {
            vehicleId,
            serviceName: row.schedule.serviceName,
            defaultToDoText: row.schedule.defaultToDoText,
            intervalMonths: row.schedule.intervalMonths,
            intervalMiles: row.schedule.intervalMiles,
            nextDueDate,
            nextDueMileage,
            isActive: true,
          },
        });
        console.log(`Created maintenance schedule: ${row.schedule.serviceName}`);
      }
    }
  }

  console.log("Seeding complete! 9 spreadsheet vehicles and work orders initialized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
