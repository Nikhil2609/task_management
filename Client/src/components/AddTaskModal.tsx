import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { createTask, updateTask } from "../redux/slices/boardSlice";
import { AppDispatch, RootState } from "../redux/store";
import { MODAL_MODE } from "../utils/enums";
import dayjs from "dayjs";

interface AddTaskModalProps {
  mode: "create" | MODAL_MODE.VIEW | "edit" | null;
  onClose: () => void;
}

// Validation schema
const TaskSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(700, "Description must be at most 700 characters")
    .required("Description is required"),
});

const AddTaskModal = ({ mode, onClose }: AddTaskModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask } = useSelector((state: RootState) => state.board);

  const initialValues = {
    title: selectedTask?.title ?? "",
    description: selectedTask?.description ?? "",
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
  }) => {
    try {
      if (selectedTask) {
        await dispatch(updateTask({ ...values, _id: selectedTask._id }));
      } else {
        await dispatch(createTask(values));
      }
    } catch (error) {
      console.error("Something went wrong:", error);
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={mode !== null} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === "edit"
          ? "Edit Task"
          : mode === "create"
          ? "Add New Task"
          : "Task Details"}
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={TaskSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          isSubmitting,
          handleChange,
          handleBlur,
          values,
        }) => (
          <Form>
            <DialogContent>
              {mode === MODAL_MODE.VIEW ? (
                <>
                  <Typography variant="h6">Title: {values.title}</Typography>
                  <Typography variant="body1">
                    Description: {values.description}
                  </Typography>
                  <Typography variant="body2">
                    Created at: {dayjs(selectedTask?.createdAt).format("DD/MM/YYYY, hh:mm:ss")}
                  </Typography>
                </>
              ) : (
                <>
                  <TextField
                    name="title"
                    label="Title"
                    variant="standard"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                    fullWidth
                  />
                  <Box>
                    <TextField
                      name="description"
                      label="Description"
                      variant="standard"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      fullWidth
                      multiline
                      minRows={4}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, textAlign: "right" }}
                    >
                      {values.description.length}/700
                    </Typography>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {mode !== MODAL_MODE.VIEW ? (
                <>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : selectedTask ? (
                      "Update Task"
                    ) : (
                      "Add Task"
                    )}
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={onClose}>
                  Close
                </Button>
              )}
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddTaskModal;
