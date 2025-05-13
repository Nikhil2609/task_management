import axiosInstance from "../utils/axiosInstance";
import { API_URL } from "../utils/enums";

export const authService = {
  async signup(
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ) {
    const response = await axiosInstance.post(
      `${API_URL.BASE_URL}/auth/signup`,
      {
        firstname: first_name,
        lastname: last_name,
        email: email,
        password: password,
      }
    );
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await axiosInstance.post(`${API_URL.BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  async logout() {
    const response = await axiosInstance.get(`${API_URL.BASE_URL}/auth/logout`);
    return response.data;
  },

  async firebaseLogin(idToken: string, screenName: string) {
    const response = await axiosInstance.post(
      `${API_URL.BASE_URL}/auth/social-firebase-login`,
      {
        idToken,
        screenName
      }
    );
    return response.data;
  },
};
