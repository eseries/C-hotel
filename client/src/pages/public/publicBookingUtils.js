import { formatCurrency as formatNairaCurrency } from '../../utils/currency';

export const PUBLIC_BOOKING_STORAGE_KEY = 'hotelpro_public_booking';
export const formatCurrency = formatNairaCurrency;

export const parseAmenities = (amenities) => {
  if (!amenities) return [];

  try {
    const parsed = JSON.parse(amenities);
    if (Array.isArray(parsed)) return parsed;
  } catch (_error) {
    // Fall back to delimited strings.
  }

  return String(amenities)
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 1;
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const buildSearchQuery = ({ hotelId, checkIn, checkOut, guests }) => {
  const params = new URLSearchParams();
  if (hotelId) params.set('hotelId', hotelId);
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  if (guests) params.set('guests', guests);
  return params.toString();
};

export const saveLastBooking = (reservation) => {
  sessionStorage.setItem(PUBLIC_BOOKING_STORAGE_KEY, JSON.stringify(reservation));
};

export const loadLastBooking = () => {
  const raw = sessionStorage.getItem(PUBLIC_BOOKING_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const getRoomImageClass = (seed = '') => {
  const palettes = [
    'from-sky-500 via-cyan-500 to-blue-700',
    'from-amber-500 via-orange-500 to-rose-600',
    'from-emerald-500 via-teal-500 to-cyan-700',
    'from-fuchsia-500 via-pink-500 to-rose-700'
  ];
  const index = String(seed)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return palettes[index];
};
