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
      const distance = calculateDistance(
        location.latitude,
        location.longitue,
        nextStop.latitude,
        nextStop.longitude
      );
      if (!distance) {
        throw new Error("distance couldn't be calculated");
      }
      const speed = location.speed ? location.speed * 3.6 : 10; //fallback
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
      console.log('response', response);

      const eta = response.data;
      return eta;
    } catch (error) {
      console.error('error of get eta is :', error);
    }
  }
}
