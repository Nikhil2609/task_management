import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box className="not-found-container">
        <Typography variant="h4" component="h2" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
