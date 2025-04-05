import { del, get, post, put } from './api.service';

const base_url = 'users/v2';

export const getAll = (params: {
        page?: number,
        per_page?: number,
        search?: string,
        order?: string,
        status?: string,
        role?: string
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

export const remove = (id: number | undefined) => {
    return del(`${base_url}/${id}`);
}
