import { get } from './api.service';

const base_url = 'bookings/v1/reports';

export const getAllWorkers = (params: {
    page?: number,
    per_page?: number,
    search?: string,
    start_date?: string,
    end_date?: string,
    type?: string,
    status?: string,
    order?: string,
    byMonth?: string,
    worker_id?: number | (number | string)[]
} = {}) => {
    const queryString = Object.keys(params)
        .filter(key => params[key as keyof typeof params])
        .map(key => {
            return `${key}=${params[key as keyof typeof params]}`;
        }).join('&');

    let url = base_url + '/workers';

    return get(queryString ? url + `?${queryString}` : url);
}

export const getWorkerById = (id: number, params: string = '') => {
    return get(`${base_url}/workers/${id}${params}`);
}