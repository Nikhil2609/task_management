import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
// import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import AuthFormWrapper from "../../components/AuthFormWrapper";
import { registerUser } from "../../redux/slices/authSlice";
import { AppDispatch } from "../../redux/store";
import { PUBLIC_ROUTE } from "../../utils/enums";

// Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
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
      );
      navigate(PUBLIC_ROUTE.LOGIN);
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setSubmitting(false);
    }
  };

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
              type="password"
              margin="normal"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />
            <Field
              as={TextField}
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              margin="normal"
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
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

      <Button variant="contained">Signup with Google</Button>
      {/* <GoogleLogin onSuccess={...} onError={...} /> */}
    </AuthFormWrapper>
  );
};

export default Signup;
