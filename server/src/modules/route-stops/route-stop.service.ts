import { ServiceResponse } from '@/shared/types';
import { RouteStopRepository } from './route-stop.repository';
import { RouteStopDto } from './route-stop.dto';

export class RouteStopService {
  constructor(private routeStopRepository: RouteStopRepository) {}

  async createRouteStop(
    routeId: number,
    latitude: number,
    longitude: number,
    stopOrder: number,
    name: string
  ): Promise<ServiceResponse<any>> {
    try {
      console.log('stop order', stopOrder);
      const routeStop = await this.routeStopRepository.createRouteStop(
        routeId,
        name,
        latitude,
        longitude,
        stopOrder
      );
      if (!routeStop) {
        return ServiceResponse.databaseError('Failed to create route stop');
      }

      const routeDto = RouteStopDto.fromEntity(routeStop);
      return ServiceResponse.created(routeDto);
    } catch (error) {
      console.error('Error creating route stop:', error);
      return ServiceResponse.internalError(
        'An unexpected error occurred while creating route stop'
      );
    }
  }
}
