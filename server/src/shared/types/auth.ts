import { ROLES, TRIP_STATUS } from '../constants/constant';

export type UserRole = keyof typeof ROLES;
export type TripStatus = keyof typeof TRIP_STATUS;
