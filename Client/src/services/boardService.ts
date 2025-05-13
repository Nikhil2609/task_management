import { ITask } from "../redux/slices/boardSlice";
import axiosInstance from "../utils/axiosInstance";
import { API_URL } from "../utils/enums";

export const boardService = {
  async getTasks() {
    const response = await axiosInstance.get(
      `${API_URL.BASE_URL}/tasks`
    );
    return response.data;
  },

  async getTaskById(taskId: string) {
    const response = await axiosInstance.get(
      `${API_URL.BASE_URL}/board/get-task-by-id/${taskId}`
    );
    return response.data;
  },

  async createTask(title: string, description: string) {
    const response = await axiosInstance.post(
      `${API_URL.BASE_URL}/board/add-task`,
      {
        title,
        description,
      }
    );
    return response.data;
  },

  async updateTask(data: Partial<ITask>) {
    const response = await axiosInstance.post(
      `${API_URL.BASE_URL}/board/update-task`,
      data
    );
    return response.data;
  },

  async deleteTask(taskId: string) {
    const response = await axiosInstance.post(
      `${API_URL.BASE_URL}/board/delete-task`,
      { taskId }
    );
    return response.data;
  },
};
