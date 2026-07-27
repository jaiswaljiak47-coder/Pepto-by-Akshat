import dataSource from '../data-source';
import { User, UserRole } from '@/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

// Run with: npm run seed
async function seed() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);

  const adminExists = await userRepo.findOneBy({ email: 'admin@pepto.app' });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
    await userRepo.save(
      userRepo.create({
        fullName: 'PEPTO Admin',
        email: 'admin@pepto.app',
        passwordHash,
        role: UserRole.ADMIN,
        emailVerified: true,
      }),
    );
    console.log('✅ Seeded admin user: admin@pepto.app / ChangeMe123!');
  }

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
