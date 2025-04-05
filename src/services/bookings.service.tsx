import { del, get, post, postFormData, put } from './api.service';

const base_url = 'bookings/v1';

export const getAll = (params: {
        page?: number,
        per_page?: number,
        search?: string,
        order?: string,
        start_date?: string,
        end_date?: string,
        status?: string,
        was_paid?: string,
        operator_id?: number,
        created_by?: string,
        firstService?: string
} = {}) => {
    const queryString = Object.keys(params)
        .filter(key => params[key as keyof typeof params])
        .map(key => {
            return `${key}=${params[key as keyof typeof params]}`;
        }).join('&');

    let url = queryString ? base_url + `?${queryString}` : base_url;

    return get(url);
}

export const getById = (id: number) => {
    return get(`${base_url}/${id}`);
}

export const draft = (id: Number | undefined = undefined) => {
    return post(`${base_url}/draft${id ? '/' + id : ''}`, {});
}

export const pending = (data: object) => {
    return post(`${base_url}/pending`, data);
}

export const create = (data: { values: object, id: number }) => {
    return post(`${base_url}/${data.id}`, data.values);
}

export const update = (data: { values: object, id: number }) => {
    return put(`${base_url}/${data.id}`, data.values);
}

export const updateStatus = (data: { values: object, id: number }) => {
    return put(`${base_url}/${data.id}/updateStatus`, data.values);
}

export const updateVoucher = (data: { values: object, id: number }) => {
    return put(`${base_url}/${data.id}/updateVoucher`, data.values);
}

export const updatePending = (data: { values: object, id: number }) => {
    return put(`${base_url}/${data.id}/updatePending`, data.values);
}

export const sendVoucher = (data: { formData: object, id: number }) => {
    return postFormData(`${base_url}/${data.id}/sendVoucher`, data.formData);
}

export const remove = (id: number | undefined) => {
    return del(`${base_url}/${id}`);
}

export const getAllTrashed = (params: {
    page?: number,
    per_page?: number,
    search?: string,
    order?: string,
    start_date?: string,
    end_date?: string
} = {}) => {
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

export const getTrashedById = (id: number) => {
    return get(`${base_url}/${id}/trashed`);
}

export const restore = (id: number) => {
    return put(`${base_url}/${id}/restore`);
}

export const forceRemove = (data: object) => {
    return post(`${base_url}/force`, { ...data, _method: 'DELETE' });
}

export const bookingStatistic = () => {
    return get(`${base_url}/statistic`);
}
