import React from "react";
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { clearAuthState } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";

interface IProps {
  title: string;
  children: React.ReactNode;
}

const AuthFormWrapper = ({ title, children }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.auth);

  return (
    <>
      <Snackbar
        open={!!error?.length}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={3000}
        onClose={() => dispatch(clearAuthState())}
      >
        <Alert
          onClose={() => dispatch(clearAuthState())}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
      <Box className="auth-form-wrapper">
        <Typography variant="h4" className="auth-form-title">
          {title}
        </Typography>
        <Box className="auth-form">{children}</Box>
      </Box>
    </>
  );
};

export default AuthFormWrapper;
