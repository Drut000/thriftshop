import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "jackets" },
      update: {},
      create: { name: "Jackets", slug: "jackets" },
    }),
    prisma.category.upsert({
      where: { slug: "shirts" },
      update: {},
      create: { name: "Shirts", slug: "shirts" },
    }),
    prisma.category.upsert({
      where: { slug: "pants" },
      update: {},
      create: { name: "Pants", slug: "pants" },
    }),
    prisma.category.upsert({
      where: { slug: "dresses" },
      update: {},
      create: { name: "Dresses", slug: "dresses" },
    }),
    prisma.category.upsert({
      where: { slug: "shoes" },
      update: {},
      create: { name: "Shoes", slug: "shoes" },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: { name: "Accessories", slug: "accessories" },
    }),
    prisma.category.upsert({
      where: { slug: "bags" },
      update: {},
      create: { name: "Bags", slug: "bags" },
    }),
    prisma.category.upsert({
      where: { slug: "sweaters" },
      update: {},
      create: { name: "Sweaters", slug: "sweaters" },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create shipping zone for Poland
  const polandZone = await prisma.shippingZone.upsert({
    where: { id: "poland-zone" },
    update: {},
    create: {
      id: "poland-zone",
      name: "Poland",
      countries: ["PL"],
    },
  });

  // Create shipping methods for Poland
  await Promise.all([
    prisma.shippingMethod.upsert({
      where: { id: "inpost-paczkomat" },
      update: {},
      create: {
        id: "inpost-paczkomat",
        zoneId: polandZone.id,
        name: "InPost Paczkomat",
        description: "Delivery to InPost locker",
        price: 12.99,
        estimatedDays: "1-2 business days",
        active: true,
      },
    }),
    prisma.shippingMethod.upsert({
      where: { id: "inpost-courier" },
      update: {},
      create: {
        id: "inpost-courier",
        zoneId: polandZone.id,
        name: "InPost Courier",
        description: "Door-to-door delivery",
        price: 18.99,
        estimatedDays: "1-2 business days",
        active: true,
      },
    }),
    prisma.shippingMethod.upsert({
      where: { id: "dpd-courier" },
      update: {},
      create: {
        id: "dpd-courier",
        zoneId: polandZone.id,
        name: "DPD Courier",
        description: "Standard courier delivery",
        price: 15.99,
        estimatedDays: "2-3 business days",
        active: true,
      },
    }),
  ]);

  console.log("✅ Created shipping zone and methods for Poland");

  // Create sample products (for development)
  if (process.env.NODE_ENV === "development") {
    const jacketsCategory = categories.find((c) => c.slug === "jackets");
    const shirtsCategory = categories.find((c) => c.slug === "shirts");

    if (jacketsCategory && shirtsCategory) {
      const sampleProducts = await Promise.all([
        prisma.product.upsert({
          where: { slug: "vintage-levis-denim-jacket" },
          update: {},
          create: {
            name: "Vintage Levi's Denim Jacket",
            slug: "vintage-levis-denim-jacket",
            description:
              "Classic 90s Levi's denim jacket in excellent condition. Perfect fading and authentic vintage wear. Size fits like modern M/L.",
            price: 189.0,
            oldPrice: 249.0,
            categoryId: jacketsCategory.id,
            size: "L",
            condition: "very_good",
            brand: "Levi's",
            color: "Blue",
            material: "100% Cotton Denim",
            status: "available",
          },
        }),
        prisma.product.upsert({
          where: { slug: "ralph-lauren-oxford-shirt" },
          update: {},
          create: {
            name: "Ralph Lauren Oxford Shirt",
            slug: "ralph-lauren-oxford-shirt",
            description:
              "Crisp white oxford shirt from Ralph Lauren. Button-down collar, classic fit. Minimal wear, looks almost new.",
            price: 79.0,
            categoryId: shirtsCategory.id,
            size: "M",
            condition: "like_new",
            brand: "Ralph Lauren",
            color: "White",
            material: "100% Cotton",
            status: "available",
          },
        }),
        prisma.product.upsert({
          where: { slug: "military-m65-field-jacket" },
          update: {},
          create: {
            name: "Military M65 Field Jacket",
            slug: "military-m65-field-jacket",
            description:
              "Authentic military M65 field jacket from the 80s. Olive green with original brass buttons. Great patina.",
            price: 220.0,
            categoryId: jacketsCategory.id,
            size: "M",
            condition: "good",
            brand: "US Military",
            color: "Olive Green",
            material: "Cotton Sateen",
            status: "available",
          },
        }),
      ]);

      console.log(`✅ Created ${sampleProducts.length} sample products`);
    }
  }

  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
