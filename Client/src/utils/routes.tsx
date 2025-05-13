import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../layout";
import { PRIVATE_ROUTE, PUBLIC_ROUTE } from "./enums";
import { RootState } from "../redux/store";

// Import your pages
const Login = React.lazy(() => import("../features/auth/Login"));
const Signup = React.lazy(() => import("../features/auth/Signup"));
const Board = React.lazy(() => import("../features/board/Board"));

interface RouteProps {
  element: React.ReactNode;
}

// PrivateRoute component - redirects to login if not authenticated
const PrivateRoute: React.FC<RouteProps> = ({ element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return (
    <>
      {isAuthenticated ? element : <Navigate to={PUBLIC_ROUTE.LOGIN} replace />}
    </>
  );
};

// Auth routes - redirect to dashboard if already logged in
const AuthRoute: React.FC<RouteProps> = ({ element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return (
    <>
      {!isAuthenticated ? (
        element
      ) : (
        <Navigate to={PRIVATE_ROUTE.BOARD} replace />
      )}
    </>
  );
};

// Create router
const router = createBrowserRouter([
  {
    path: PUBLIC_ROUTE.HOME,
    element: <Layout />,
    children: [
      {
        path: PUBLIC_ROUTE.LOGIN,
        element: <AuthRoute element={<Login />} />,
      },
      {
        path: PUBLIC_ROUTE.SIGNUP,
        element: <AuthRoute element={<Signup />} />,
      },
      {
        path: PRIVATE_ROUTE.BOARD,
        element: <PrivateRoute element={<Board />} />,
      },
    ],
  },
]);

export default router;
