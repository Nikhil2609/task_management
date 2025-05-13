import axiosInstance from "../utils/axiosInstance";

export const authService = {
  async signup(
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ) {
    const response = await axiosInstance.post(`/auth/signup`, {
      firstname: first_name,
      lastname: last_name,
      email: email,
      password: password,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await axiosInstance.post(`/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  async logout() {
    const response = await axiosInstance.get(`/auth/logout`);
    return response.data;
  },

  async firebaseLogin(idToken: string, screenName: string) {
    const response = await axiosInstance.post(`/auth/social-firebase-login`, {
      idToken,
      screenName,
    });
    return response.data;
  },

  async googleLogin(accessToken: string) {
    const response = await axiosInstance.post(
      `/auth/google-login`,
      { accessToken }
    );
    return response.data;
  }
  
};
