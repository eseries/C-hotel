import http from './http';

export const getDashboardStats = (hotelId) => http.get('/reports/dashboard', { params: { hotelId } });
export const getRevenueStats = (hotelId) => http.get('/reports/revenue', { params: { hotelId } });
export const getRevenueChartData = (hotelId) => http.get('/reports/revenue/chart', { params: { hotelId } });
