import publicHttp from './publicHttp';

export const fetchPublicHotel = ({ slug, id } = {}) => publicHttp.get('/hotels/public', { params: { ...(slug ? { slug } : {}), ...(id ? { id } : {}) } });
export const searchPublicRooms = (params) => publicHttp.get('/rooms', { params });
export const fetchPublicRoom = (id) => publicHttp.get(`/rooms/${id}`);
export const createPublicReservation = (payload) => publicHttp.post('/reservations', payload);
export const fetchPublicReservation = (code) => publicHttp.get(`/reservations/${code}`);
export const cancelPublicReservation = (id) => publicHttp.patch(`/reservations/${id}/cancel`);
