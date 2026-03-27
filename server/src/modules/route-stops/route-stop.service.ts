import { ServiceResponse } from '@/shared/types';
import { RouteStopRepository } from './route-stop.repository';
import { RouteStopDto } from './route-stop.dto';
import { RouteRepository } from '../routes/route.repository';
import { redis } from '@/shared/redis/redis';
import { clearCacheByPattern } from '@/shared/utils/clear-cache-pattern';

export class RouteStopService {
  private routeRepository: RouteRepository;
  constructor(private routeStopRepository: RouteStopRepository) {
    this.routeRepository = new RouteRepository();
  }

  async createRouteStop(
    routeId: number,
    latitude: number,
    longitude: number,
    stopOrder: number,
    name: string
  ): Promise<ServiceResponse<any>> {
    try {
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

      await redis.del(`routes:${routeId}`);
      await clearCacheByPattern('routes:*');
      const routeDto = RouteStopDto.fromEntity(routeStop);
      return ServiceResponse.created(routeDto);
    } catch (error) {
      console.error('Error creating route stop:', error);
      return ServiceResponse.internalError(
        'An unexpected error occurred while creating route stop'
      );
    }
  }
  async addRouteStops(routeId: number, stops: any[]): Promise<ServiceResponse<any>> {
    try {
      const route = await this.routeRepository.getRouteById(routeId);

      if (!route) {
        return ServiceResponse.notFound('Route not found');
      }

      const orders = stops.map((s) => s.order);
      const uniqueOrders = new Set(orders);

      if (orders.length !== uniqueOrders.size) {
        return ServiceResponse.badRequest('Duplicate stop order detected');
      }

      const insertedStops = await this.routeStopRepository.addRouteStops(routeId, stops);

      return ServiceResponse.created(insertedStops);
    } catch (error) {
      console.error('AddRouteStops Error:', error);
      return ServiceResponse.internalError('Failed to add stops');
    }
  }
}
