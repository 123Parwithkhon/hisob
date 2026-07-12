import { prisma } from '../config/prisma.js';
import type { RegisterDto } from '../validators/auth.validator.js';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(dto: RegisterDto, passwordHash: string) {
    return prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });
  }

     async update(id: string, data: { 
    name?: string; 
    phone?: string; 
    timezone?: string; 
    theme?: string; 
    passwordHash?: string;
    currency?: string;
  }) {
    // Разделяем поля чтобы theme обрабатывать отдельно
    const { theme, ...restData } = data;
    
    const updateData: any = { ...restData };
    if (theme) {
      updateData.theme = theme;
    }
    
    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}