/*
 * This function calculates the distance between two geographical points using the Haversine formula.
 * It takes the latitude and longitude of both points as input and returns the distance in meters.
 * The Haversine formula accounts for the curvature of the Earth, providing an accurate distance measurement.
 * This is particularly useful for applications like tracking the movement of buses, where precise distance calculations are necessary.
 */

/*
 *Trip completion is determined using a geofencing mechanism,
 *where the trip is automatically marked completed,
 * when the vehicle enters a 50-meter radius of the destination coordinates.
 */
export default function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
