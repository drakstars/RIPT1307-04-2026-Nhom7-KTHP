import { PrismaClient, PlanType, SubscriptionStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock analytics data...");

  // Get user role
  const userRole = await prisma.role.findFirst({ where: { name: 'USER' } });
  if (!userRole) {
    console.error("USER role not found! Please run the main seed first.");
    return;
  }

  const passwordHash = await bcrypt.hash('123456', 10);

  // Generate 20 mock users over the last 14 days
  const userNames = [
    "Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D", "Hoang Van E",
    "Vu Thi F", "Ngo Van G", "Do Thi H", "Bui Van I", "Dang Thi K",
    "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis",
    "David Miller", "Emily Wilson", "Frank Thomas", "Grace Martinez", "Henry Taylor"
  ];

  const createdUsers = [];
  const now = new Date();

  // Create users
  for (let i = 0; i < userNames.length; i++) {
    const signupDate = new Date();
    signupDate.setDate(now.getDate() - (i % 14)); // spread over 14 days
    
    const email = `student${i + 1}@gmail.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: userNames[i],
        passwordHash,
        roleId: userRole.id,
        createdAt: signupDate,
        updatedAt: signupDate,
      }
    });
    createdUsers.push(user);
  }

  // Create subscriptions & payments
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    
    // Divide users: 10 FREE, 7 PRO, 3 TEAM
    let plan: PlanType = 'FREE';
    if (i >= 10 && i < 17) plan = 'PRO';
    if (i >= 17) plan = 'TEAM';

    const sub = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { plan },
      create: {
        userId: user.id,
        plan,
        status: 'ACTIVE',
        startedAt: user.createdAt,
      }
    });

    if (plan !== 'FREE') {
      const amount = plan === 'PRO' ? 9.99 : 24.99;
      // Add payment histories
      const paymentDate = new Date(user.createdAt);
      paymentDate.setHours(paymentDate.getHours() + 1); // paid 1hr after signup

      await prisma.paymentHistory.create({
        data: {
          subscriptionId: sub.id,
          userId: user.id,
          amount,
          plan,
          billingCycle: 'monthly',
          status: 'SUCCESS',
          reference: `txn_${Math.random().toString(36).substring(2, 11)}`,
          paidAt: paymentDate,
          createdAt: paymentDate,
        }
      });
    }
  }

  console.log(`Successfully seeded ${createdUsers.length} mock users, subscriptions and payments!`);
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
