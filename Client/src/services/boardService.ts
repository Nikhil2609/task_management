import { ITask } from "../redux/slices/boardSlice";
import axiosInstance from "../utils/axiosInstance";

export const boardService = {
  async getTasks(search: string, sort: string) {
    const response = await axiosInstance.get(`/tasks`, {
      params: { search, sort },
    });
    return response;
  },

  async createTask(title: string, description: string) {
    const response = await axiosInstance.post(`/tasks`, {
      title,
      description,
    });
    return response;
  },

  async updateTask(data: Partial<ITask>) {
    const response = await axiosInstance.put(`/tasks/${data._id}`, data);
    return response;
  },

  async updateStatus(taskId: string, status: string) {
    const response = await axiosInstance.put(`/tasks/${taskId}/status`, {
      status,
    });
    return response;
  },

  async deleteTask(taskId: string) {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return response;
  },
};
