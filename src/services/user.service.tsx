import { get, post } from "./api.service";

const base_url = 'users/v2';

export const listUserRole = (role: string) => {
  return get(`${base_url}/list/${role}`);
};

export const getUser = () => {
  return get("/user");
};

export const authenticate = (data: any) => {
  return post(`${base_url}/login`, data);
};

export const resetPassword = (data: any) => {
  return post(`${base_url}/resetPassword`, data);
};

export const forgotPassword = (data: any) => {
  return post(`${base_url}/forgotPassword`, data);
};

export const logout = () => {
  return get(`${base_url}/logout`);
};