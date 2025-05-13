import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import AuthFormWrapper from "../../components/AuthFormWrapper";
import { loginUser } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { PRIVATE_ROUTE } from "../../utils/enums";
import GoogleAuth from "./GoogleAuth";

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await dispatch(
        loginUser({
          email: values.email,
          password: values.password,
        })
      );
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      navigate(PRIVATE_ROUTE.BOARD);
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthFormWrapper title="Login">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />
            <Field
              as={TextField}
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      className="show-password-button"
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      <Typography variant="body2" color="text.secondary">
        Don't have an account?{" "}
        <Link className="link" to="/signup">
          Signup
        </Link>
      </Typography>

      <GoogleAuth buttonText="Login with Google" />
    </AuthFormWrapper>
  );
};

export default Login;
