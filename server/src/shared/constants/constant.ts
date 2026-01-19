export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  DRIVER: 'DRIVER',
  GUEST: 'GUEST',
} as const;

export const TRIP_STATUS = {
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PLANNED: 'PLANNED',
} as const;

export const REDIS_CHANNELS = {
  TRIP_LOCATION: 'trip_location',
};
