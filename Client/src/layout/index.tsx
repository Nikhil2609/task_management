import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { Box } from "@mui/material";

const Layout = () => {
  return (
    <Box className="layout-wrapper">
      <Header />
      <Box className="layout-container">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
