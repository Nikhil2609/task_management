import axios, { AxiosError, AxiosResponse } from "axios";
// You can import your auth slice actions later
// import { logout } from '../store/slices/userSlice';

const axiosInstance = axios.create({
  baseURL: "https://task-management-api-5koo.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // dispatch(logout());
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
