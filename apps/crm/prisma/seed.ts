import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { Customer } from "@prisma/client";
const prisma = new PrismaClient();

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Lucknow",
];

const categories = [
  "Coffee",
  "Fashion",
  "Beauty",
  "Electronics",
  "Grocery",
];

async function clearDatabase() {
  await prisma.conversion.deleteMany();
  await prisma.event.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.campaignStats.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
}

async function seedCustomers() {
  const customers = [];

  for (let i = 0; i < 150; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: `9${faker.string.numeric(9)}`,
        city: faker.helpers.arrayElement(cities),

        totalSpend: 0,
        orderCount: 0,
        avgOrderValue: 0,
      },
    });

    customers.push(customer);
  }

  return customers;
}

async function seedOrders(customers: Customer[]) {
  const orders = [];

  for (const customer of customers) {
    const orderCount = faker.number.int({
      min: 1,
      max: 8,
    });

    for (let i = 0; i < orderCount; i++) {
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,

          amount: faker.number.int({
            min: 300,
            max: 12000,
          }),

          category: faker.helpers.arrayElement(categories),

          productTags: [
            faker.commerce.productAdjective(),
            faker.commerce.product(),
          ],

          createdAt: faker.date.past({
            years: 1,
          }),
        },
      });

      orders.push(order);
    }
  }

  return orders;
}

async function updateCustomerMetrics(customers: Customer[]) {
  for (const customer of customers) {
    const orders = await prisma.order.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalSpend = orders.reduce(
      (sum, order) => sum + Number(order.amount),
      0
    );

    const orderCount = orders.length;

    const avgOrderValue =
      orderCount > 0
        ? totalSpend / orderCount
        : 0;

    const lastOrderDate =
      orders[0]?.createdAt ?? null;

    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        totalSpend,
        orderCount,
        avgOrderValue,
        lastOrderDate,
      },
    });
  }
}

async function seedSegments() {
  await prisma.segment.createMany({
    data: [
      {
        name: "High Value Customers",
        description: "Customers spending over ₹5000",
        naturalLanguageInput: "customers who spent more than 5000",
        query: {
          totalSpend: {
            gt: 5000,
          },
        },
        audienceSize: 0,
      },

      {
        name: "Dormant Customers",
        description: "No purchases in last 60 days",
        naturalLanguageInput: "customers inactive for 60 days",
        query: {
          lastOrderDays: {
            gt: 60,
          },
        },
        audienceSize: 0,
      },

      {
        name: "Recent Buyers",
        description: "Purchased in last 30 days",
        naturalLanguageInput: "customers purchased within 30 days",
        query: {
          lastOrderDays: {
            lt: 30,
          },
        },
        audienceSize: 0,
      },
    ],
  });

  console.log("✅ Created 3 segments");
}


async function main() {
  console.log("🌱 Starting seed...");

  await clearDatabase();

  console.log("🧹 Database cleared");

  const customers = await seedCustomers();

console.log(`✅ Created ${customers.length} customers`);

const orders = await seedOrders(customers);

console.log(`✅ Created ${orders.length} orders`);

await updateCustomerMetrics(customers);

console.log("✅ Customer metrics updated");

await seedSegments();

console.log("🎉 Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });