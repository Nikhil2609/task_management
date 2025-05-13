import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { boardService } from "../../services/boardService";

export interface ITask {
  userId: string;
  _id: string;
  title: string;
  description: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BoardState {
  tasks: ITask[];
  selectedTask: ITask | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: BoardState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  success: null,
};

export const getTasks = createAsyncThunk(
  "board/get-tasks",
  async (
    { search, sort }: { search: string; sort: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await boardService.getTasks(search, sort);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while fetching tasks."
      );
    }
  }
);

export const createTask = createAsyncThunk(
  "board/create-task",
  async (
    {
      title,
      description,
    }: {
      title: string;
      description: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await boardService.createTask(title, description);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while creating task."
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  "board/update-task",
  async (data: Partial<ITask>, { rejectWithValue }) => {
    try {
      const response = await boardService.updateTask(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while updating task."
      );
    }
  }
);

export const updateStatus = createAsyncThunk(
  "board/update-status",
  async (
    { taskId, status }: { taskId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await boardService.updateStatus(taskId, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while updating task status."
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "board/delete-task",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await boardService.deleteTask(taskId);
      return { taskId, ...response };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while deleting task."
      );
    }
  }
);

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearBoardState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
    updateTasks: (state, action) => {
      state.tasks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all tasks
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error =
          (action.payload as string) || "Error while fetching tasks.";
      })

      // Create task
      .addCase(createTask.pending, (state) => {
        state.error = null;
        state.success = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const newTask = action.payload.data;
        state.tasks.push(newTask);
        state.loading = false;
        state.error = null;
        state.success = "Task created successfully.";
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error =
          (action.payload as string) || "Error while creating task.";
      })

      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const selectedTask = action.payload.data;
        state.selectedTask = selectedTask;
        state.tasks = state.tasks.map((task) =>
          task._id === selectedTask._id ? selectedTask : task
        );
        state.loading = false;
        state.error = null;
        state.success = "Task updated successfully.";
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error =
          (action.payload as string) || "Error while updating task.";
      })

      // Update task status
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        const selectedTask = action.payload.data;
        state.tasks = state.tasks.map((task) =>
          task._id === selectedTask._id ? selectedTask : task
        );
        state.loading = false;
        state.error = null;
        state.success = "Task status updated successfully.";
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error =
          (action.payload as string) || "Error while updating task status.";
      })

      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.error = null;
        state.success = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { taskId } = action.payload;
        state.tasks = state.tasks.filter((task) => task._id !== taskId);
        state.loading = false;
        state.error = null;
        state.success = "Task deleted successfully.";
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error =
          (action.payload as string) || "Error while deleting task.";
      });
  },
});

export const { setSelectedTask, clearBoardState, updateTasks } =
  boardSlice.actions;

export default boardSlice.reducer;
