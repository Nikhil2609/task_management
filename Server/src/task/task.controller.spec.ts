import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { EditTaskDto } from './dto/edit-task.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SearchTasksDto } from './dto/search-tasks.dto';
import { TaskStatus } from './task.schema';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Create a mock JwtAuthGuard
jest.mock('../auth/jwt-auth.guard', () => {
  return {
    JwtAuthGuard: jest.fn().mockImplementation(() => {
      return {
        canActivate: jest.fn().mockReturnValue(true),
      };
    }),
  };
});

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  const mockTaskService = {
    createTask: jest.fn(),
    editTask: jest.fn(),
    updateStatus: jest.fn(),
    getAllTasks: jest.fn(),
    deleteTask: jest.fn(),
    getTasksByStatus: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUser = {
    id: 'user_id',
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    it('should call taskService.createTask with correct parameters', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'This is a test task',
      };
      const createdTask = {
        _id: 'task_id',
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: TaskStatus.CREATED,
        userId: mockUser.id,
      };
      mockTaskService.createTask.mockResolvedValue(createdTask);

      // Act
      const result = await controller.createTask(createTaskDto, mockRequest);

      // Assert
      expect(taskService.createTask).toHaveBeenCalledWith(
        createTaskDto.title,
        createTaskDto.description,
        mockUser.id,
      );
      expect(result).toEqual(createdTask);
    });
  });

  describe('editTask', () => {
    it('should call taskService.editTask with correct parameters', async () => {
      // Arrange
      const taskId = 'task_id';
      const editTaskDto: EditTaskDto = {
        title: 'Updated Task',
        description: 'This is an updated task',
      };
      const updatedTask = {
        _id: taskId,
        title: editTaskDto.title,
        description: editTaskDto.description,
        status: TaskStatus.CREATED,
        userId: mockUser.id,
      };
      mockTaskService.editTask.mockResolvedValue(updatedTask);

      // Act
      const result = await controller.editTask(taskId, editTaskDto, mockRequest);

      // Assert
      expect(taskService.editTask).toHaveBeenCalledWith(
        taskId,
        editTaskDto.title,
        editTaskDto.description,
        mockUser.id,
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('updateStatus', () => {
    it('should call taskService.updateStatus with correct parameters', async () => {
      // Arrange
      const taskId = 'task_id';
      const updateStatusDto: UpdateStatusDto = {
        status: TaskStatus.INPROGRESS,
      };
      const updatedTask = {
        _id: taskId,
        title: 'Test Task',
        description: 'This is a test task',
        status: updateStatusDto.status,
        userId: mockUser.id,
      };
      mockTaskService.updateStatus.mockResolvedValue(updatedTask);

      // Act
      const result = await controller.updateStatus(taskId, updateStatusDto, mockRequest);

      // Assert
      expect(taskService.updateStatus).toHaveBeenCalledWith(
        taskId,
        updateStatusDto.status,
        mockUser.id,
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('getAllTasks', () => {
    it('should call taskService.getAllTasks with correct parameters', async () => {
      // Arrange
      const tasks = [
        {
          _id: 'task_id_1',
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.CREATED,
          userId: mockUser.id,
        },
        {
          _id: 'task_id_2',
          title: 'Task 2',
          description: 'Description 2',
          status: TaskStatus.INPROGRESS,
          userId: mockUser.id,
        },
      ];
      mockTaskService.getAllTasks.mockResolvedValue(tasks);

      // Act
      const result = await controller.getAllTasks(mockRequest);

      // Assert
      expect(taskService.getAllTasks).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(tasks);
    });
  });

  describe('deleteTask', () => {
    it('should call taskService.deleteTask with correct parameters', async () => {
      // Arrange
      const taskId = 'task_id';
      mockTaskService.deleteTask.mockResolvedValue(undefined);

      // Act
      await controller.deleteTask(taskId, mockRequest);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId, mockUser.id);
    });
  });

  describe('getTasksByStatus', () => {
    it('should call taskService.getTasksByStatus with user ID when no search string is provided', async () => {
      // Arrange
      const searchTasksDto: SearchTasksDto = {
        searchString: '',
      };
      
      const groupedTasks = {
        created: [
          {
            _id: 'task_id_1',
            title: 'Created Task 1',
            description: 'Task in created status',
            status: TaskStatus.CREATED,
            userId: mockUser.id,
          },
          {
            _id: 'task_id_2',
            title: 'Created Task 2',
            description: 'Another task in created status',
            status: TaskStatus.CREATED,
            userId: mockUser.id,
          },
        ],
        inprogress: [
          {
            _id: 'task_id_3',
            title: 'In Progress Task',
            description: 'Task in progress',
            status: TaskStatus.INPROGRESS,
            userId: mockUser.id,
          },
        ],
        completed: [
          {
            _id: 'task_id_4',
            title: 'Completed Task',
            description: 'Task that is complete',
            status: TaskStatus.COMPLETED,
            userId: mockUser.id,
          },
        ],
      };

      mockTaskService.getTasksByStatus.mockResolvedValue(groupedTasks);

      // Act
      const result = await controller.getTasksByStatus(searchTasksDto, mockRequest);

      // Assert
      expect(taskService.getTasksByStatus).toHaveBeenCalledWith(mockUser.id, '');
      expect(result).toEqual(groupedTasks);
      expect(result.created.length).toBe(2);
      expect(result.inprogress.length).toBe(1);
      expect(result.completed.length).toBe(1);
    });

    it('should call taskService.getTasksByStatus with search string when provided', async () => {
      // Arrange
      const searchTasksDto: SearchTasksDto = {
        searchString: 'test',
      };
      
      const groupedTasks = {
        created: [
          {
            _id: 'task_id_1',
            title: 'Test Task',
            description: 'Task in created status',
            status: TaskStatus.CREATED,
            userId: mockUser.id,
          },
        ],
        inprogress: [],
        completed: [],
      };

      mockTaskService.getTasksByStatus.mockResolvedValue(groupedTasks);

      // Act
      const result = await controller.getTasksByStatus(searchTasksDto, mockRequest);

      // Assert
      expect(taskService.getTasksByStatus).toHaveBeenCalledWith(mockUser.id, 'test');
      expect(result).toEqual(groupedTasks);
      expect(result.created.length).toBe(1);
      expect(result.inprogress.length).toBe(0);
      expect(result.completed.length).toBe(0);
    });
  });
}); 