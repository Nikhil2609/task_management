import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { boardService } from "../../services/boardService";

export interface ITask {
  _id: string;
  title: string;
  description: string;
  status?: string;
  position?: number;
  created_by: string;
  assigned_to: string;
  board_id: string;
  status_list_id: string;
  due_date: string;
}

export interface IStatusList {
  _id: string;
  name: string;
}

interface BoardState {
  statusList: IStatusList[];
  tasks: ITask[];
  selectedTask: ITask | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: BoardState = {
  statusList: [],
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  success: null,
};

export const getTasks = createAsyncThunk(
  "task/get-tasks-by-status",
  async (_, { rejectWithValue }) => {
    try {
      const response = await boardService.getTasks();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while fetching tasks."
      );
    }
  }
);

export const createTask = createAsyncThunk(
  "task/create",
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
  "task/update",
  async (data: Partial<ITask>, { rejectWithValue }) => {
    try {
      const response = await boardService.updateTask(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while updating task."
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "task/delete",
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

export const getTaskById = createAsyncThunk(
  "task/get-by-id",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await boardService.getTaskById(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Error while fetching task."
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
      state.tasks = [];
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get tasks by status
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.tasks = action.payload.data;
        state.loading = false;
        state.error = null;
        state.success = "Tasks fetched successfully.";
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
        state.loading = false;
        state.error = null;
        state.selectedTask = action.payload;
        state.success = "Task updated successfully.";
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error =
          (action.payload as string) || "Error while updating task.";
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
      })

      // Get task by ID
      .addCase(getTaskById.pending, (state) => {
        state.error = null;
        state.success = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
        state.loading = false;
        state.error = null;
        state.success = "Task fetched successfully.";
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.selectedTask = null;
        state.success = null;
        state.error =
          (action.payload as string) || "Error while fetching task.";
      });
  },
});

export const { setSelectedTask, clearBoardState } = boardSlice.actions;

export default boardSlice.reducer;
