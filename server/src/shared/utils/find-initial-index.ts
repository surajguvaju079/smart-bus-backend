import calculateDistance from './calculate-distance';

export const findInitialIndex = (stops: any[], location: any) => {
  let minDist = Infinity;
  let index = 0;

  stops.forEach((stop, i) => {
    const d = calculateDistance(
      location.latitude,
      location.longitude,
      stop.latitude,
      stop.longitude
    );

    if (d < minDist) {
      minDist = d;
      index = i;
    }
  });

  return index;
};
