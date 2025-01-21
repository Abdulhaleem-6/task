import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string, dto: GetTasksDto) {
    const {
      search,
      isComplete,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      userId,
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
      ...(typeof isComplete === 'boolean' ? { isComplete } : {}),
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.task.count({ where }),
    ]);

    const metadata = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };

    return { data: tasks, metadata };
  }

  async findOne(userId: string, id: number) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(userId: string, id: number, dto: Partial<CreateTaskDto>) {
    return this.prisma.task.update({
      where: {
        id,
        userId,
      },
      data: dto,
    });
  }

  async remove(userId: string, id: number) {
    return this.prisma.task.update({
      where: {
        id,
        userId,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}
