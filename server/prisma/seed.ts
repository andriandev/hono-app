import { prismaClient } from '@app/config/database';
import bcrypt from 'bcryptjs';

async function main() {
  const existingAdmin = await prismaClient.user.findFirst({
    where: { username: 'andriandev' },
  });

  if (!existingAdmin) {
    await prismaClient.user.create({
      data: {
        username: 'andriandev',
        password: await bcrypt.hash('12345678', 10),
        role: 'admin',
        is_active: true,
      },
    });
    console.log('Seeded admin user');
  } else {
    console.error('Username andriandev is already exist in database');
  }
}

main()
  .then(() => console.log('Task seed done'))
  .catch((e) => console.error(e?.message))
  .finally(() => prismaClient.$disconnect());
