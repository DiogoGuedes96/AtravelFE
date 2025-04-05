import axios, { AxiosError, AxiosResponse } from "axios";
import { AlertService } from './alert.service';
import { IAlert } from "../Interfaces/Alert.interfaces";

const userLogged = localStorage.getItem("user");

const defaultHeader = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

const token = userLogged
  ? {
      Authorization: `Bearer ${JSON.parse(userLogged).token}`,
    }
  : {};
  
const client =
  process.env.REACT_APP_CLIENT 
    ? { client: process.env.REACT_APP_CLIENT }
    : {};

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  headers: { ...defaultHeader, ...token, ...client },
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): (Promise<AxiosError> | AxiosError) => {
    const data: any = error?.response?.data;

    if (error?.response?.status === 422) {
      let alerts: IAlert[] = [];

      Object.keys(data?.errors)
        .forEach(key => {
          data?.errors[key].forEach((errorMessage: string) => alerts.push({ text: errorMessage, type: 'error' }));
        });

      AlertService.sendAlert(alerts);
    } else if (data?.message) {
      AlertService.sendAlert([{ text: data?.message, type: 'error' }]);
    }

    return Promise.reject(error);
  }
);

const put = async (url: string, params: any = null) => {
  const response = await api.put(url, params);
  return response.data;
};

const del = async (url: string) => {
  const response = await api.delete(url);
  return response.data;
};

const get = async (url: string, data: any = null) => {
  const response = await api.get(url);
  return response.data;
};

const post = async (url: string, params: any) => {
  const response = await api.post(url, params);
  return response?.data;
};

const postFormData = async (url: string, formData: any) => {
  const response = await api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response?.data;
};

export { put, del, get, post, postFormData };
