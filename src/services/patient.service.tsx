import { get, post } from "./api.service";

export const patientPost = (data: any) => {
    return post('patients/v1/store', data);
};

