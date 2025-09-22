import axios from 'axios';

export const api = axios.create({ baseURL: '/api', withCredentials: true });
export const fetcher = (url: string) => api.get(url).then(r => r.data);
