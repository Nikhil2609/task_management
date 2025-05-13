export const API_URL = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
};

export enum PUBLIC_ROUTE {
  HOME = "/",
  LOGIN = "/login",
  SIGNUP = "/signup",
}

export enum PRIVATE_ROUTE {
  BOARD = "/board",
}
