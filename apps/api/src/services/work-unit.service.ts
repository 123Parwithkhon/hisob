import { WorkUnitRepository } from '../repositories/work-unit.repository.js';
import type { CreateWorkUnitDto, UpdateWorkUnitDto } from '../validators/work-unit.validator.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class WorkUnitService {
  private workUnitRepo: WorkUnitRepository;

  constructor() {
    this.workUnitRepo = new WorkUnitRepository();
  }

  async list(userId: string) {
    return this.workUnitRepo.findByUser(userId);
  }

  async create(userId: string, dto: CreateWorkUnitDto) {
    // Проверяем, нет ли уже такой единицы
    const existing = await this.workUnitRepo.findByUser(userId);
    const exists = existing.find((w) => w.name.toLowerCase() === dto.name.toLowerCase());
    if (exists) {
      throw new ValidationError('Единица работы с таким названием уже существует');
    }

    return this.workUnitRepo.create(userId, dto);
  }

  async update(userId: string, id: string, dto: UpdateWorkUnitDto) {
    const workUnit = await this.workUnitRepo.findById(userId, id);
    if (!workUnit) {
      throw new NotFoundError('Единица работы не найдена');
    }
    return this.workUnitRepo.update(id, dto);
  }

  async delete(userId: string, id: string) {
    const workUnit = await this.workUnitRepo.findById(userId, id);
    if (!workUnit) {
      throw new NotFoundError('Единица работы не найдена');
    }
    if (workUnit._count.transactions > 0) {
      throw new ValidationError('Нельзя удалить единицу работы, которая используется в транзакциях');
    }
    await this.workUnitRepo.delete(id);
    return { success: true };
  }

  async getStats(userId: string, workUnitId: string) {
    return this.workUnitRepo.getStats(userId, workUnitId);
  }
}