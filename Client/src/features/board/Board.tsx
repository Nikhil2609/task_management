import React, { useEffect, useState } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DropResult,
} from "@hello-pangea/dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  clearBoardState,
  deleteTask,
  getTasks,
  ITask,
  setSelectedTask,
  updateStatus,
  updateTasks,
} from "../../redux/slices/boardSlice";
import AddTaskModal from "../../components/AddTaskModal";
import dayjs from "dayjs";
import { MODAL_MODE, STATUS_LISTS } from "../../utils/enums";
import useDebounce from "../../hooks/useDebounce";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const BoardDetail = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, selectedTask, loading, success, error } = useSelector(
    (state: RootState) => state.board
  );

  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("default");
  const [modalMode, setModalMode] = useState<MODAL_MODE | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    dispatch(setSelectedTask(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTasks({ search: debouncedSearch, sort }));
  }, [debouncedSearch, sort, dispatch]);

  const getTasksByStatus = (status: string) => {
    return tasks?.filter(
      (task) => task.status?.toLowerCase() === status.toLowerCase()
    );
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the task being moved
    const taskToMove = tasks?.find((task) => task._id === draggableId);

    if (!taskToMove) return;

    // Create a new array of tasks to update the UI immediately
    const newTasks = Array.from(tasks);
    const sourceList = newTasks.filter(
      (task) => task.status?.toLowerCase() === source.droppableId.toLowerCase()
    );
    const destinationList =
      source.droppableId !== destination.droppableId
        ? newTasks.filter(
            (task) =>
              task.status?.toLowerCase() ===
              destination.droppableId.toLowerCase()
          )
        : sourceList;

    // Remove the task from the source list
    sourceList.splice(source.index, 1);

    // Add the task to the destination list
    const updatedTask = {
      ...taskToMove,
      status: destination.droppableId,
    };
    destinationList.splice(destination.index, 0, updatedTask);

    // Update the tasks array with the new order
    const updatedTasks = newTasks.map((task) => {
      if (task._id === taskToMove._id) {
        return updatedTask;
      }
      return task;
    });

    // Update the local state immediately for smooth UI
    dispatch(updateTasks(updatedTasks));

    // If moving between lists, update the status on the server
    if (source.droppableId !== destination.droppableId) {
      await dispatch(
        updateStatus({
          taskId: draggableId,
          status: destination.droppableId,
        })
      );
    }
  };

  const handleTaskClick = (task: ITask, mode: MODAL_MODE = MODAL_MODE.EDIT) => {
    dispatch(setSelectedTask(task));
    setModalMode(mode);
  };

  const handleDeleteTask = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    task: ITask
  ) => {
    event.stopPropagation();
    dispatch(setSelectedTask(task));
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTask) {
      dispatch(deleteTask(selectedTask?._id));
      setDeleteModalOpen(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleOpenAddModal = () => {
    dispatch(setSelectedTask(null));
    setModalMode(MODAL_MODE.CREATE);
  };

  const handleCloseAddModal = () => {
    setModalMode(null);
    // Clear selected task when modal is closed
    dispatch(setSelectedTask(null));
  };

  const renderTaskCard = (task: ITask, index: number) => (
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: 8,
            opacity: snapshot.isDragging ? 0.7 : 1,
          }}
        >
          <Card className="task-card">
            <Box>
              <Box>
                <Typography fontWeight={600}>{task.title}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="task-card-description"
                >
                  {task.description}
                </Typography>
                <Box className="task-card-created-at">
                  <Typography className="created-at-text">
                    Created at:{" "}
                    {dayjs(task.createdAt).format("DD/MM/YYYY, hh:mm:ss")}
                  </Typography>
                </Box>
                <Box className="task-card-button-container">
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={(e) => handleDeleteTask(e, task)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={() => handleTaskClick(task, MODAL_MODE.EDIT)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleTaskClick(task, MODAL_MODE.VIEW)}
                  >
                    View details
                  </Button>
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      )}
    </Draggable>
  );

  return (
    <>
      <Backdrop open={loading} style={{ zIndex: 1000 }}>
        <CircularProgress />
      </Backdrop>

      <Snackbar
        open={!!success?.length}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={3000}
        onClose={() => dispatch(clearBoardState())}
      >
        <Alert
          onClose={() => dispatch(clearBoardState())}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error?.length}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={3000}
        onClose={() => dispatch(clearBoardState())}
      >
        <Alert
          onClose={() => dispatch(clearBoardState())}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
      <Box className="add-task-button">
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddModal}
        >
          Add Task
        </Button>
      </Box>

      <Box className="search-sort-container">
        <Box className="flex-item">
          <Typography>Search:</Typography>
          <TextField
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
          />
        </Box>
        <Box className="flex-item">
          <Typography>Sort By:</Typography>
          <FormControl fullWidth>
            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="latest">Recent</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {STATUS_LISTS.length > 0 ? (
        <Box className="board-content">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box className="status-container">
              {STATUS_LISTS.map((list) => {
                const filteredTasks = getTasksByStatus(list.id);
                return (
                  <Box key={list.id} className="status-list">
                    <Box className="status-list-header">
                      <Typography className="status-header-text">
                        {list.name}
                      </Typography>
                    </Box>
                    <Droppable droppableId={list.id} type="card">
                      {(
                        provided: DroppableProvided,
                        snapshot: { isDraggingOver: boolean }
                      ) => {
                        return (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="status-list-body"
                          >
                            {filteredTasks?.map((task: ITask, index: number) =>
                              renderTaskCard(task, index)
                            )}
                            {provided.placeholder}
                          </Box>
                        );
                      }}
                    </Droppable>
                  </Box>
                );
              })}
            </Box>
          </DragDropContext>
        </Box>
      ) : (
        <Box className="empty-board-message">
          Your board looks empty, but full of love!
        </Box>
      )}

      <AddTaskModal mode={modalMode} onClose={handleCloseAddModal} />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default BoardDetail;
