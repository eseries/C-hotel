import http from './http';

export const loginApi = (payload) => http.post('/auth/login', payload);
export const registerApi = (payload) => http.post('/auth/register', payload);
export const logoutApi = () => http.post('/auth/logout');
export const changePasswordApi = (payload) => http.patch('/auth/change-password', payload);
