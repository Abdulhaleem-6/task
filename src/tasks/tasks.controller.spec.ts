import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;

  // First, we create a mock version of the TasksService that we can control in our tests
  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  // Before each test, we set up a fresh instance of our controller
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);

    // Clear all mock implementations and calls before each test
    jest.clearAllMocks();
  });

  // Test the create endpoint
  describe('create', () => {
    const createTaskDto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
    };

    const mockRequest = {
      user: { sub: 'test-user-id' },
    };

    it('should create a new task', async () => {
      // Set up the expected return value from the service
      const expectedResult = {
        id: 1,
        ...createTaskDto,
        userId: mockRequest.user.sub,
        isComplete: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTasksService.create.mockResolvedValue(expectedResult);

      // Call the controller method
      const result = await controller.create(mockRequest, createTaskDto);

      // Verify the service was called with correct parameters
      expect(tasksService.create).toHaveBeenCalledWith(
        mockRequest.user.sub,
        createTaskDto,
      );

      // Verify the result matches what we expect
      expect(result).toEqual(expectedResult);
    });
  });

  // Test the findAll endpoint
  describe('findAll', () => {
    const mockRequest = {
      user: { sub: 'test-user-id' },
    };

    const mockQuery: GetTasksDto = {
      search: 'test',
      isComplete: true,
      sortBy: 'createdAt',
      sortOrder: 'asc',
      page: 1,
      limit: 10,
    };

    it('should return paginated tasks', async () => {
      // Set up the expected return value
      const expectedResult = {
        data: [
          {
            id: 1,
            title: 'Test Task',
            description: 'Test Description',
            isComplete: true,
            userId: mockRequest.user.sub,
          },
        ],
        metadata: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockTasksService.findAll.mockResolvedValue(expectedResult);

      // Call the controller method
      const result = await controller.findAll(mockRequest, mockQuery);

      // Verify service was called with correct parameters
      expect(tasksService.findAll).toHaveBeenCalledWith(
        mockRequest.user.sub,
        mockQuery,
      );

      expect(result).toEqual(expectedResult);
    });
  });

  // Test the findOne endpoint
  describe('findOne', () => {
    const mockRequest = {
      user: { sub: 'test-user-id' },
    };

    const taskId = 1;

    it('should return a single task', async () => {
      const expectedResult = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        isComplete: false,
        userId: mockRequest.user.sub,
      };

      mockTasksService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(taskId, mockRequest);

      expect(tasksService.findOne).toHaveBeenCalledWith(
        mockRequest.user.sub,
        taskId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  // Test the delete endpoint
  describe('delete', () => {
    const mockRequest = {
      user: { sub: 'test-user-id' },
    };

    const taskId = 1;

    it('should soft delete a task', async () => {
      const expectedResult = {
        id: taskId,
        isDeleted: true,
      };

      mockTasksService.remove.mockResolvedValue(expectedResult);

      const result = await controller.delete(taskId, mockRequest);

      expect(tasksService.remove).toHaveBeenCalledWith(
        mockRequest.user.sub,
        taskId,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
