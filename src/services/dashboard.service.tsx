import { get } from "./api.service";

const base_url = 'dashboard/v2';

const getKpis = () => get(`/${base_url}/kpis`);

export {
    getKpis
}
