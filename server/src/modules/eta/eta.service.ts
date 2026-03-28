import calculateDistance from '@/shared/utils/calculate-distance';
import axios from 'axios';

export class EtaService {
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
}
