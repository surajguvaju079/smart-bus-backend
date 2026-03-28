import calculateDistance from './calculate-distance';

/*
 * Later compare with speed as well
 * return d<30 && speed<10;
 *
 */

export const isNearStop = (loc: any, stop: any) => {
  const d = calculateDistance(loc.latitude, loc.longitude, stop.latitude, stop.longitude);
  return d < 30;
};
