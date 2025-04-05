import { del, get, post, put } from "./api.service";

export const all = (
    page: number = 0,
    search: string | undefined = undefined,
    sorterName: string | undefined = undefined,
    pageSize: number | undefined = undefined
) => {
    let url = 'routes/v1';

    const queryParams: { page?: string, per_page?: string, search?: string, sorter?: string } = {};

    if (page)
        queryParams['page'] = page.toString();

    if (pageSize)
        queryParams['per_page'] = pageSize.toString();

    if (search)
        queryParams['search'] = search;

    if (sorterName)
        queryParams['sorter'] = sorterName;

    const queryString = new URLSearchParams(queryParams).toString();

    if (queryString) {
        url += `?${queryString}`;
    }

    return get(url);
}

export const one = (id: string) => {
    return get(`routes/v1/${id}`);
}

export const edit = (data: { data: object, id: string }) => {
    return put(`routes/v1/${data.id}`, data.data);
}

export const create = (data: any) => {
    return post('routes/v1', data);
}

export const deleteRoute = (id: string | undefined) => {
    return del(`routes/v1/${id}`);
} 