import calculateDistance from '@/shared/utils/calculate-distance';
import axios from 'axios';

export class EtaService {
  /**
   * Calculates distance to the next stop and requests an ETA prediction from the
   * external ETA service using the current speed, hour, weekday, and distance.
   *
   * @param tripId The trip ID associated with the ETA request
   * @param nextStop The upcoming stop coordinates and metadata
   * @param location The current vehicle location and optional speed
   * @returns ETA details with estimated arrival time, speed, and distance
   */
  public async getEta({
    tripId,
    nextStop,
    location,
  }: {
    tripId: number;
    nextStop: any;
    location: any;
  }) {
    try {
      console.log('next stop is', nextStop);
      console.log('location is', location);
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        Number(nextStop.latitude),
        Number(nextStop.longitude)
      );
      if (!distance) {
        throw new Error("distance couldn't be calculated");
      }
      const speed = location.speed ? location.speed * 3.6 : 10;
      const now = new Date();
      console.log('hi there eta service hit');

      const response = await axios.post(
        'http://192.168.224.90:8000/predict_eta',
        {
          speed,
          hour: now.getHours(),
          weekday: now.getDay(),
          distance,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const eta = {
        estimated_time_of_arrival: Math.ceil(response.data.estimated_time_of_arrival * 3600),
        speed,
        distance,
      };
      return eta;
    } catch (error) {
      console.error('error of get eta is :', error);
    }
  }

  /**
   * Calculates cumulative ETA values for each upcoming stop starting from the
   * current stop index and current vehicle location.
   *
   * @param stops The ordered stops for the route
   * @param currentIndex The stop index to begin ETA calculation from
   * @param currentLocation The current vehicle location
   * @returns A list of stop IDs, stop names, and cumulative ETA values
   */
  getMultiStopETA = async ({ stops, currentIndex, currentLocation }: any) => {
    const results = [];

    let prevPoint = currentLocation;
    let totalETA = 0;

    for (let i = currentIndex; i < stops.length; i++) {
      const stop = stops[i];

      try {
        const etaResult = await this.getEta({
          tripId: null,
          nextStop: stop,
          location: prevPoint,
        });

        if (!etaResult) continue;

        totalETA += etaResult.estimated_time_of_arrival;

        results.push({
          stopId: stop.id,
          stopName: stop.name,
          eta: totalETA,
        });

        prevPoint = {
          latitude: stop.latitude,
          longitude: stop.longitude,
        };
      } catch (err) {
        console.error('Multi-stop ETA error:', err);
      }
    }

    return results;
  };
}
