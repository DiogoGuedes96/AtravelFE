import { del, get, post, put } from './api.service';

const base_url = 'services/v1/states';

export const getAll = (params: {
        page?: number,
        per_page?: number,
        search?: string,
        status?: string,
        order?: string
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

export const create = (data: object) => {
    return post(base_url, data);
}

export const update = (data: { values: object, id: number }) => {
    return put(`${base_url}/${data.id}`, data.values);
}

export const updateDefault = (data: { values: { is_default: boolean }, id: number }) => {
    return put(`${base_url}/${data.id}/updateDefault`, data.values);
}

export const remove = (id: number | undefined) => {
    return del(`${base_url}/${id}`);
}
