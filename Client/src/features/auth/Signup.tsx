import React, { useEffect, useState } from "react";
import {
  Box,
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
import { registerUser } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { PRIVATE_ROUTE, PUBLIC_ROUTE } from "../../utils/enums";
import GoogleAuth from "./GoogleAuth";

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: SignupFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Signup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (
    values: SignupFormValues,
    { setSubmitting }: FormikHelpers<SignupFormValues>
  ) => {
    try {
      await dispatch(
        registerUser({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
        })
      ).unwrap();

      navigate(PUBLIC_ROUTE.LOGIN);
    } catch (error) {
      console.error("Signup error:", error);
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
    <AuthFormWrapper title="Signup">
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
              label="First Name"
              name="firstName"
              margin="normal"
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={touched.firstName && errors.firstName}
            />
            <Field
              as={TextField}
              fullWidth
              label="Last Name"
              name="lastName"
              margin="normal"
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={touched.lastName && errors.lastName}
            />
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
            <Field
              as={TextField}
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              margin="normal"
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      className="show-password-button"
                      onClick={handleClickShowConfirmPassword}
                    >
                      {showConfirmPassword ? "HIDE" : "SHOW"}
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
              className="auth-submit-button"
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Signup"
              )}
            </Button>
          </Form>
        )}
      </Formik>

      <Box className="auth-links">
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login
          </Link>
        </Typography>
      </Box>

      <GoogleAuth buttonText="Signup with Google" />
    </AuthFormWrapper>
  );
};

export default Signup;
