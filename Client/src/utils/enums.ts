export enum PUBLIC_ROUTE {
  HOME = "/",
  LOGIN = "/login",
  SIGNUP = "/signup",
}

export enum PRIVATE_ROUTE {
  BOARD = "/board",
}

export enum MODAL_MODE {
  CREATE = "create",
  EDIT = "edit",
  VIEW = "view",
}

export const STATUS_LISTS = [
  { id: "CREATED", name: "TODO" },
  { id: "INPROGRESS", name: "IN PROGRESS" },
  { id: "COMPLETED", name: "DONE" },
];
