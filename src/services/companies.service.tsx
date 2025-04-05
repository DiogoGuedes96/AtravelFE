import { get, postFormData } from "./api.service";

const base_url = 'companies/v1';

export const getCompanyDetails = () => {
  return get(`${base_url}/details`);
};

export const createCompany = (data: object) => {
    return postFormData(`${base_url}`, data);
};

export const updateCompany = (data: object) => {
    return postFormData(`${base_url}`, { _method: 'PUT', ...data });
}
