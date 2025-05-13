import React from "react";
import { Box, Typography } from "@mui/material";

interface IProps {
  title: string;
  children: React.ReactNode;
}

const AuthFormWrapper = ({ title, children }: IProps) => {
  return (
    <Box className="auth-form-wrapper">
      <Typography variant="h4" className="auth-form-title">
        {title}
      </Typography>
      <Box className="auth-form">{children}</Box>
    </Box>
  );
};

export default AuthFormWrapper;
