import { get, post } from "./api.service";

const getProducts = (
  page: number = 1,
  perPage: number = 20,
  search: string = "",
  sorter: any = null,
  filters: any = null
) => {
  let params: any = { page, perPage };

  if (search && search.length > 2) params.search = search;

  if (sorter && sorter.field && sorter.sortDirection) {
    params.sort = sorter.field;
    params.sortDirection = sorter.sortDirection;
  }

  if (filters && filters.length > 0) {
    params.unit = filters.join(",");
  }

  let queryParams = new URLSearchParams(params).toString();

  const url = params
    ? `products/v2/list?${queryParams}`
    : `products/v2/list`;

  return get(url);
};

const getUnitsProducts = () => {
  return get(`products/v2/units`);
};

const saveProducts = (infos: any) => {
  return post(`products/v2/update`, infos);
};

export { getProducts, saveProducts, getUnitsProducts };
