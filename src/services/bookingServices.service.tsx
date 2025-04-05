import { del, get, post, postFormData, put } from './api.service';

const base_url = 'bookings/v1/services';

export const getAll = (
    params: {
        booking_id?: number,
        withChild?: string,
        withHistoric?: string,
        onlyWorkerType?: string,
        page?: number,
        per_page?: number,
        search?: string,
        order?: string,
        service_type_id?: (number | string)[],
        was_paid?: string,
        staff_id?: number,
        supplier_id?: number,
        operator_id?: number,
        start_date?: string,
        end_date?: string,
    } = {}
) => {
    const queryString = Object.keys(params)
        .filter(key => params[key as keyof typeof params])
        .map(key => {
            return `${key}=${params[key as keyof typeof params]}`;
        }).join('&');

    let url = queryString ? `${base_url}?${queryString}` : base_url;

    return get(url);
}

export const getById = (id: number) => {
    return get(`${base_url}/${id}`);
}

export const create = (data: object) => {
    return post(base_url, data);
}

export const sendTimetable = (data: { formData: object }) => {
    return postFormData(`${base_url}/sendTimetable`, data.formData);
}

export const update = (data: { values: object, id: number }) => {
    return put(`${base_url}/${data.id}`, data.values);
}

export const remove = (id: number | undefined) => {
    return del(`${base_url}/${id}`);
}

export const getColumns = () => {
    return get(`${base_url}/columns`);
}

export const updateColumns = (columns: string[]) => {
    return put(`${base_url}/updateColumns`, { columns });
}

export const getAllTrashed = (
    params: {
        booking_id?: number
    } = {}
) => {
    const queryString = Object.keys(params)
        .filter(key => params[key as keyof typeof params])
        .map(key => {
            return `${key}=${params[key as keyof typeof params]}`;
        }).join('&');
 
    let url = base_url + '/trashed';
 
    if (queryString) {
        url += `?${queryString}`;
    }
 
    return get(url);
}