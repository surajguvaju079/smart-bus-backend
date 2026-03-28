import calculateDistance from './calculate-distance';

export const getNextStop = (stops: any[], currentLocation: any) => {
  let minDist = Infinity;
  let nearest = null;

  for (const stop of stops) {
    const d = calculateDistance(
      stop.latitude,
      stop.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );

    if (d < Infinity) {
      minDist = d;
      nearest = stop;
    }
  }
  return nearest;
};
