import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcrypt';
import dayjs from 'dayjs';

const prisma = new PrismaClient()
async function main() {
  const testUser = await prisma.user.upsert({
    where: { email: 'testuser@test.com' },
    update: {},
    create: {
      email: 'testuser@test.com',
      password: hashSync('password123', 10),
      name: 'Test User',
      Tasks: {
        create: [
            {
                name: 'Task 1',
                description: 'This is task 1',
                dueDate: dayjs().add(1, 'day').toDate(),
            },
            {
                name: 'Task 2',
                description: 'This is task 2',
                dueDate: dayjs().add(2, 'day').toDate(),
            },
        ]
      }
    },
  })
  console.log({testUser})
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })