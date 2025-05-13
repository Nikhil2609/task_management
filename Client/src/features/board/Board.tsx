import React, { useEffect, useRef } from "react";
import { Button, Card, Typography } from "@mui/material";
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
  deleteTask,
  getTasks,
  IStatusList,
  ITask,
  setSelectedTask,
  updateTask,
} from "../../redux/slices/boardSlice";

const BoardDetail = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { statusList, tasks } =
    useSelector((state: RootState) => state.board);

  useEffect(() => {
    (async () => {
        await dispatch(getTasks());
    })();
  }, [dispatch]);

  // useEffect(() => {
  //   if (statusList.length > 0 && currentUser) {
  //     statusList.forEach(async (status) => {
  //       if (status?._id) {
  //         await dispatch(
  //           getTasksByStatusId({
  //             statusId: status._id,
  //             filterBy: [currentUser?.id],
  //           })
  //         );
  //       }
  //     });
  //   }
  // }, [dispatch, statusList]);

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

    // Moving cards
    const sourceList = statusList?.find(
      (list: IStatusList) => list._id === source.droppableId
    );
    const destList = statusList?.find(
      (list: IStatusList) => list._id === destination.droppableId
    );

    if (!sourceList || !destList) return;

    // Find the task being moved
    const taskToMove = tasks?.find((task) => task._id === draggableId);

    if (!taskToMove) return;

    dispatch(
      updateTask({
        ...taskToMove,
        position: destination.index + 1,
        status_list_id: destination.droppableId,
      })
    );

    if (source.droppableId === destination.droppableId) {
      // Same list movement
      await dispatch(
        updateTask({
          _id: draggableId,
          position: destination.index + 1,
        })
      );
    } else {
      // Different list movement
      await dispatch(
        updateTask({
          _id: draggableId,
          status_list_id: destination.droppableId,
          position: destination.index + 1,
        })
      );
    }
  };

  const handleTaskClick = (task: ITask) => {
    dispatch(setSelectedTask(task));
  };

  const handleDeleteTask = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    taskId: string
  ) => {
    event.stopPropagation();
    dispatch(deleteTask(taskId));
  };

  const renderTaskCard = (task: ITask, index: number) => (
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: 8,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
          onClick={() => handleTaskClick(task)}
        >
          <Card
            style={{
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              background: task.status === "Completed" ? "#6bf16b26" : "",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Typography
                  style={{
                    marginBottom: 4,
                    fontWeight: 500,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {task.title}
                </Typography>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {task.due_date && (
                    <Typography
                      style={{
                        marginBottom: 0,
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                        fontSize: "12px",
                        borderRadius: "4px",
                      }}
                    >
                      Created at: {task.due_date}
                    </Typography>
                  )}
                </div>
              </div>
              <Button
                variant="contained"
                color="error"
                size="small"
                style={{ marginLeft: 4 }}
                onClick={(e) => handleDeleteTask(e, task._id)}
              />
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );

  return (
    <>
      {statusList?.length > 0 ? (
        <div className="board-content">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="all-lists"
              direction="horizontal"
              type="list"
            >
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ display: "flex", gap: "16px" }}
                >
                  {statusList?.map((list: IStatusList, index: number) => {
                    return (
                      <Draggable
                        key={list._id}
                        draggableId={list._id}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              minWidth: 280,
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "#80808026",
                                borderRadius: 6,
                                padding: "8px 8px 0 8px",
                                height: "100%",
                                maxWidth: "300px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                                ref={wrapperRef}
                              >
                                <Typography
                                  style={{ fontSize: "16px", margin: "8px" }}
                                >
                                  {list.name}
                                </Typography>
                              </div>
                              <Droppable droppableId={list._id} type="card">
                                {(
                                  provided: DroppableProvided,
                                  snapshot: { isDraggingOver: boolean }
                                ) => {
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      style={{
                                        borderRadius: 6,
                                        minHeight: 10,
                                        maxHeight: "62vh",
                                        overflow: "auto",
                                      }}
                                    >
                                      {tasks.map((task: ITask, index: number) =>
                                        renderTaskCard(task, index)
                                      )}
                                      {provided.placeholder}
                                    </div>
                                  );
                                }}
                              </Droppable>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            flexDirection: "column",
          }}
        >
          Your board looks empty, but full of love!
        </div>
      )}
    </>
  );
};

export default BoardDetail;
