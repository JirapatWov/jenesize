import { PrismaClient, Marketplace } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });
  console.log('✅ Created admin user:', user.email);

  // Create sample products
  const matchaProduct = await prisma.product.create({
    data: {
      title: 'Organic Matcha Green Tea Powder - Premium Grade',
      imageUrl:
        'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop',
      offers: {
        create: [
          {
            marketplace: Marketplace.LAZADA,
            storeName: 'Green Tea House',
            price: 450.0,
            currency: 'THB',
            externalUrl: 'https://www.lazada.co.th/products/matcha-powder-123',
            externalId: 'LZ123456',
          },
          {
            marketplace: Marketplace.SHOPEE,
            storeName: 'Organic Tea Shop',
            price: 420.0,
            currency: 'THB',
            externalUrl: 'https://shopee.co.th/Matcha-Powder-456',
            externalId: 'SP789012',
          },
        ],
      },
    },
  });
  console.log('✅ Created product:', matchaProduct.title);

  const yogaMatProduct = await prisma.product.create({
    data: {
      title: 'Premium Non-Slip Yoga Mat with Carrying Strap',
      imageUrl:
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
      offers: {
        create: [
          {
            marketplace: Marketplace.LAZADA,
            storeName: 'Fitness World',
            price: 890.0,
            currency: 'THB',
            externalUrl: 'https://www.lazada.co.th/products/yoga-mat-789',
            externalId: 'LZ789456',
          },
          {
            marketplace: Marketplace.SHOPEE,
            storeName: 'Active Life Store',
            price: 850.0,
            currency: 'THB',
            externalUrl: 'https://shopee.co.th/Yoga-Mat-Premium-012',
            externalId: 'SP345678',
          },
        ],
      },
    },
  });
  console.log('✅ Created product:', yogaMatProduct.title);

  const wirelessEarbudsProduct = await prisma.product.create({
    data: {
      title: 'Wireless Bluetooth Earbuds with Charging Case',
      imageUrl:
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
      offers: {
        create: [
          {
            marketplace: Marketplace.LAZADA,
            storeName: 'Tech Gadgets Pro',
            price: 1290.0,
            currency: 'THB',
            externalUrl: 'https://www.lazada.co.th/products/earbuds-321',
            externalId: 'LZ321654',
          },
          {
            marketplace: Marketplace.SHOPEE,
            storeName: 'Digital Store',
            price: 1190.0,
            currency: 'THB',
            externalUrl: 'https://shopee.co.th/Wireless-Earbuds-654',
            externalId: 'SP987654',
          },
        ],
      },
    },
  });
  console.log('✅ Created product:', wirelessEarbudsProduct.title);

  // Create sample campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Summer Deal 2025',
      slug: 'summer-deal-2025',
      description: 'Hot deals for summer! Get the best prices on top products.',
      utmCampaign: 'summer2025',
      utmSource: 'website',
      utmMedium: 'affiliate',
      startAt: new Date('2025-06-01'),
      endAt: new Date('2025-08-31'),
      isActive: true,
    },
  });
  console.log('✅ Created campaign:', campaign.name);

  // Create affiliate links for the campaign
  const links = await Promise.all([
    prisma.link.create({
      data: {
        productId: matchaProduct.id,
        campaignId: campaign.id,
        marketplace: Marketplace.LAZADA,
        shortCode: 'matcha-lz',
        targetUrl: `https://www.lazada.co.th/products/matcha-powder-123?utm_campaign=summer2025&utm_source=website&utm_medium=affiliate`,
      },
    }),
    prisma.link.create({
      data: {
        productId: matchaProduct.id,
        campaignId: campaign.id,
        marketplace: Marketplace.SHOPEE,
        shortCode: 'matcha-sp',
        targetUrl: `https://shopee.co.th/Matcha-Powder-456?utm_campaign=summer2025&utm_source=website&utm_medium=affiliate`,
      },
    }),
    prisma.link.create({
      data: {
        productId: yogaMatProduct.id,
        campaignId: campaign.id,
        marketplace: Marketplace.LAZADA,
        shortCode: 'yoga-lz',
        targetUrl: `https://www.lazada.co.th/products/yoga-mat-789?utm_campaign=summer2025&utm_source=website&utm_medium=affiliate`,
      },
    }),
    prisma.link.create({
      data: {
        productId: yogaMatProduct.id,
        campaignId: campaign.id,
        marketplace: Marketplace.SHOPEE,
        shortCode: 'yoga-sp',
        targetUrl: `https://shopee.co.th/Yoga-Mat-Premium-012?utm_campaign=summer2025&utm_source=website&utm_medium=affiliate`,
      },
    }),
    prisma.link.create({
      data: {
        productId: wirelessEarbudsProduct.id,
        campaignId: campaign.id,
        marketplace: Marketplace.LAZADA,
        shortCode: 'earbuds-lz',
        targetUrl: `https://www.lazada.co.th/products/earbuds-321?utm_campaign=summer2025&utm_source=website&utm_medium=affiliate`,
      },
    }),
    prisma.link.create({
      data: {
        productId: wirelessEarbudsProduct.id,
        campaignId: campaign.id,
        marketplace: Marketplace.SHOPEE,
        shortCode: 'earbuds-sp',
        targetUrl: `https://shopee.co.th/Wireless-Earbuds-654?utm_campaign=summer2025&utm_source=website&utm_medium=affiliate`,
      },
    }),
  ]);
  console.log(`✅ Created ${links.length} affiliate links`);

  // Create some sample clicks for analytics
  const now = new Date();
  const clicks = [];
  for (let i = 0; i < 50; i++) {
    const randomLink = links[Math.floor(Math.random() * links.length)];
    const clickTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last 7 days
    clicks.push({
      linkId: randomLink.id,
      timestamp: clickTime,
      referrer: Math.random() > 0.5 ? 'https://facebook.com' : 'https://google.com',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipHash: Math.random().toString(36).substring(7),
    });
  }

  await prisma.click.createMany({
    data: clicks,
  });
  console.log(`✅ Created ${clicks.length} sample clicks`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

