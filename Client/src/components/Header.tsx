import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Typography,
} from "@mui/material";
import { AppDispatch, RootState } from "../redux/store";
import { logoutUser } from "../redux/slices/authSlice";

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography>TMS</Typography>
          {!isAuthenticated ? (
            <Box>
              <Button
                variant={location.pathname === "/login" ? "contained" : "text"}
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  mr: 2,
                }}
              >
                Login
              </Button>

              <Button
                variant={location.pathname === "/signup" ? "contained" : "text"}
                color="inherit"
                component={Link}
                to="/signup"
              >
                Signup
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                dispatch(logoutUser());
              }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
