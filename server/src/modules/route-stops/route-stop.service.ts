import { ServiceResponse } from '@/shared/types';
import { RouteStopRepository } from './route-stop.repository';

export class RouteStopService {
  constructor(private routeStopRepository: RouteStopRepository) {}

  async createRouteStop(
    routeId: number,
    latitude: number,
    longitude: number,
    stopOrder: number
  ): Promise<ServiceResponse<any>> {
    try {
      const routeStop = await this.routeStopRepository.createRouteStop(
        routeId,
        latitude,
        longitude,
        stopOrder
      );
      if (!routeStop) {
        return ServiceResponse.databaseError('Failed to create route stop');
      }
      return ServiceResponse.created(routeStop);
    } catch (error) {
      console.error('Error creating route stop:', error);
      return ServiceResponse.internalError(
        'An unexpected error occurred while creating route stop'
      );
    }
  }
}
