import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  // First create a mock version of a "task"
  const mockTask = {
    id: 1,
    title: 'Task Title',
    description: 'Task Description',
    userId: 'user-123',
    isComplete: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Also create an object that complies with our GetTasksDto class.
  const mockGetTasksDto = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              create: jest.fn().mockResolvedValue(mockTask),
              findMany: jest.fn().mockResolvedValue([mockTask]),
              count: jest.fn().mockResolvedValue(1),
              findFirst: jest.fn().mockResolvedValue(mockTask),
              update: jest.fn().mockResolvedValue(mockTask),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  // Test the create service
  it('should create a task', async () => {
    const createTaskDto = {
      title: 'New Task',
      description: 'New Task Description',
    };
    const result = await service.create('user-123', createTaskDto);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        ...createTaskDto,
        userId: 'user-123',
      },
    });
    expect(result).toEqual(mockTask);
  });

  // Test the findAll service
  it('should find all tasks with metadata', async () => {
    const result = await service.findAll('user-123', mockGetTasksDto);
    expect(prisma.task.findMany).toHaveBeenCalled();
    expect(prisma.task.count).toHaveBeenCalled();
    expect(result).toEqual({
      data: [mockTask],
      metadata: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  // Test the findOne service
  it('should find one task', async () => {
    const result = await service.findOne('user-123', 1);
    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: { id: 1, userId: 'user-123', isDeleted: false },
    });
    expect(result).toEqual(mockTask);
  });

  // Test the update service
  it('should update a task', async () => {
    const updateDto = { title: 'Updated Title' };
    const result = await service.update('user-123', 1, updateDto);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 1, userId: 'user-123' },
      data: updateDto,
    });
    expect(result).toEqual(mockTask);
  });

  // Test the remove(soft-delete) service
  it('should delete a task', async () => {
    const result = await service.remove('user-123', 1);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 1, userId: 'user-123' },
      data: { isDeleted: true },
    });
    expect(result).toEqual(mockTask);
  });
});
