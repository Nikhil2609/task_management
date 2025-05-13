import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskStatus } from './task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async createTask(title: string, description: string, userId: string): Promise<Task> {
    const task = new this.taskModel({ title, description, userId });
    return task.save();
  }

  async editTask(taskId: string, title: string, description: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: taskId, userId });
    if (!task) {
      throw new NotFoundException('Task not found or unauthorized');
    }
    task.title = title;
    task.description = description;
    return task.save();
  }

  async updateStatus(taskId: string, status: TaskStatus, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: taskId, userId });
    if (!task) {
      throw new NotFoundException('Task not found or unauthorized');
    }
    task.status = status;
    return task.save();
  }

  async getAllTasks(userId: string): Promise<Task[]> {
    return this.taskModel.find({ userId }).exec();
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: taskId, userId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found or unauthorized');
    }
  }

  async searchTasks(searchString: string, userId: string): Promise<Task[]> {
    return this.taskModel.find({
      userId,
      $or: [
        { title: { $regex: searchString, $options: 'i' } },
        { description: { $regex: searchString, $options: 'i' } },
      ],
    }).exec();
  }
} 