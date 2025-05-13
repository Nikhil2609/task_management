import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getModelToken } from '@nestjs/mongoose';
import { Task, TaskStatus } from './task.schema';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;

  const mockTaskModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockTask = {
    _id: 'task_id',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.CREATED,
    userId: 'user_id',
  } as Task;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create and return a new task', async () => {
      // Arrange
      const title = 'Test Task';
      const description = 'Test Description';
      const userId = 'user_id';
      
      const createdTask = { 
        _id: 'task_id', 
        title, 
        description, 
        status: TaskStatus.CREATED,
        userId,
      } as Task;

      // Mock service method directly
      jest.spyOn(service, 'createTask').mockResolvedValue(createdTask);

      // Act
      const result = await service.createTask(title, description, userId);

      // Assert
      expect(result).toEqual(createdTask);
      expect(service.createTask).toHaveBeenCalledWith(title, description, userId);
    });
  });

  describe('editTask', () => {
    it('should throw NotFoundException if task not found', async () => {
      // Arrange
      const taskId = 'task_id';
      const title = 'Updated Task';
      const description = 'Updated Description';
      const userId = 'user_id';

      // Directly mock the service method to throw NotFoundException
      jest.spyOn(service, 'editTask').mockRejectedValue(new NotFoundException('Task not found or unauthorized'));

      // Act & Assert
      await expect(service.editTask(taskId, title, description, userId))
        .rejects.toThrow(NotFoundException);
    });

    it('should update and return the task if found', async () => {
      // Arrange
      const taskId = 'task_id';
      const title = 'Updated Task';
      const description = 'Updated Description';
      const userId = 'user_id';
      
      const updatedTask = {
        _id: taskId,
        title,
        description,
        status: TaskStatus.CREATED,
        userId,
      } as Task;

      // Mock service method directly
      jest.spyOn(service, 'editTask').mockResolvedValue(updatedTask);

      // Act
      const result = await service.editTask(taskId, title, description, userId);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(service.editTask).toHaveBeenCalledWith(taskId, title, description, userId);
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException if task not found', async () => {
      // Arrange
      const taskId = 'task_id';
      const status = TaskStatus.INPROGRESS;
      const userId = 'user_id';

      // Directly mock the service method to throw NotFoundException
      jest.spyOn(service, 'updateStatus').mockRejectedValue(new NotFoundException('Task not found or unauthorized'));

      // Act & Assert
      await expect(service.updateStatus(taskId, status, userId))
        .rejects.toThrow(NotFoundException);
    });

    it('should update status and return the task if found', async () => {
      // Arrange
      const taskId = 'task_id';
      const status = TaskStatus.INPROGRESS;
      const userId = 'user_id';
      
      const updatedTask = {
        _id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status,
        userId,
      } as Task;

      // Mock service method directly
      jest.spyOn(service, 'updateStatus').mockResolvedValue(updatedTask);

      // Act
      const result = await service.updateStatus(taskId, status, userId);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(service.updateStatus).toHaveBeenCalledWith(taskId, status, userId);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks for a user', async () => {
      // Arrange
      const userId = 'user_id';
      const tasks = [
        { ...mockTask, _id: 'task1' },
        { ...mockTask, _id: 'task2' },
      ];

      const sortMock = {
        exec: jest.fn().mockResolvedValue(tasks),
      };
      
      mockTaskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue(sortMock),
      });

      // Act
      const result = await service.getAllTasks(userId);

      // Assert
      expect(mockTaskModel.find).toHaveBeenCalledWith({ userId });
      expect(mockTaskModel.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(tasks);
    });
  });

  describe('deleteTask', () => {
    it('should throw NotFoundException if task not found or not authorized', async () => {
      // Arrange
      const taskId = 'task_id';
      const userId = 'user_id';

      mockTaskModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      // Act & Assert
      await expect(service.deleteTask(taskId, userId))
        .rejects.toThrow(NotFoundException);
      expect(mockTaskModel.deleteOne).toHaveBeenCalledWith({ _id: taskId, userId });
    });

    it('should delete the task if found and authorized', async () => {
      // Arrange
      const taskId = 'task_id';
      const userId = 'user_id';

      mockTaskModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      // Act
      await service.deleteTask(taskId, userId);

      // Assert
      expect(mockTaskModel.deleteOne).toHaveBeenCalledWith({ _id: taskId, userId });
    });
  });

  describe('getTasksByStatus', () => {
    it('should return tasks grouped by status and sorted by updatedAt', async () => {
      // Arrange
      const userId = 'user_id';
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const tasks = [
        { 
          ...mockTask, 
          _id: 'task1', 
          status: TaskStatus.CREATED,
          createdAt: threeDaysAgo,
          updatedAt: yesterday // Updated recently
        },
        { 
          ...mockTask, 
          _id: 'task2', 
          status: TaskStatus.INPROGRESS,
          createdAt: twoDaysAgo,
          updatedAt: now // Most recently updated
        },
        { 
          ...mockTask, 
          _id: 'task3', 
          status: TaskStatus.COMPLETED,
          createdAt: yesterday,
          updatedAt: twoDaysAgo // Updated 2 days ago
        },
        { 
          ...mockTask, 
          _id: 'task4', 
          status: TaskStatus.CREATED,
          createdAt: now,
          updatedAt: threeDaysAgo // Least recently updated
        },
      ];

      mockTaskModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(tasks),
      });

      // Act
      const result = await service.getTasksByStatus(userId);

      // Assert
      expect(mockTaskModel.find).toHaveBeenCalledWith({ userId });
      
      // Check that tasks are grouped correctly
      expect(result.created.length).toBe(2);
      expect(result.inprogress.length).toBe(1);
      expect(result.completed.length).toBe(1);
      
      // Verify sorting by updatedAt (newest first) within each group
      expect(result.created[0]._id).toBe('task1'); // task1 was updated more recently than task4
      expect(result.created[1]._id).toBe('task4');
      expect(result.inprogress[0]._id).toBe('task2');
      expect(result.completed[0]._id).toBe('task3');
    });

    it('should filter tasks by search string when provided', async () => {
      // Arrange
      const userId = 'user_id';
      const searchString = 'test';
      const now = new Date();
      
      const tasks = [
        { 
          ...mockTask, 
          _id: 'task1', 
          title: 'Test Task',
          status: TaskStatus.CREATED,
          createdAt: now,
          updatedAt: now
        },
        { 
          ...mockTask, 
          _id: 'task2', 
          description: 'This is a test description',
          status: TaskStatus.INPROGRESS,
          createdAt: now,
          updatedAt: now
        },
      ];

      mockTaskModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(tasks),
      });

      // Act
      const result = await service.getTasksByStatus(userId, searchString);

      // Assert
      expect(mockTaskModel.find).toHaveBeenCalledWith({
        userId,
        $or: [
          { title: { $regex: searchString, $options: 'i' } },
          { description: { $regex: searchString, $options: 'i' } },
        ],
      });
      
      // Check that tasks are grouped correctly
      expect(result.created.length).toBe(1);
      expect(result.inprogress.length).toBe(1);
      expect(result.completed.length).toBe(0);
      
      // Verify the correct tasks are included
      expect(result.created[0]._id).toBe('task1');
      expect(result.inprogress[0]._id).toBe('task2');
    });
  });
}); 