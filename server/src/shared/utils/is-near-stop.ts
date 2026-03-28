import calculateDistance from './calculate-distance';

export const isNearStop = (loc: any, stop: any) => {
  const d = calculateDistance(loc.latitude, loc.longitude, stop.latitude, stop.longitude);
  return d < 30;
};
