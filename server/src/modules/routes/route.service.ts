import { ServiceResponse } from '@/shared/types';
import { RouteRepository } from './route.repository';
import { AllRouteWithStopsDTO, RouteDTO, RouteWithStopsDTO } from './route.dto';
import { db } from '@/shared/database/connection';
import { RouteStopRepository } from '../route-stops/route-stop.repository';
import { TripRepository } from '../trips/trip.repository';
import { redis } from '@/shared/redis/redis';

export class RouteService {
  private routeStopRepository: RouteStopRepository;
  private tripRepository: TripRepository;
  constructor(private routeRepository: RouteRepository) {
    this.routeStopRepository = new RouteStopRepository();
    this.tripRepository = new TripRepository();
  }

  async createRoute(name: string): Promise<ServiceResponse<RouteDTO>> {
    try {
      const cleanName = name.trim();
      const route = await this.routeRepository.createRoute(cleanName);
      if (!route) {
        return ServiceResponse.databaseError('Failed to create route');
      }

      const routeDTO = RouteDTO.fromEntity(route);
      if (!routeDTO) {
        return ServiceResponse.internalError('Failed to convert route to DTO');
      }
      return ServiceResponse.created(routeDTO);
    } catch (error) {
      console.error('Error creating route:', error);
      return ServiceResponse.internalError('An unexpected error occurred');
    }
  }

  async getAllRoutes(currentPage: number = 1, limit: number = 10): Promise<ServiceResponse<any>> {
    const cacheKey = `routes:page:${currentPage}:limit:${limit}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`Cached hit: ${cacheKey}`);
        return ServiceResponse.ok(JSON.parse(cached));
      }
      console.log('Cached miss!');
      const { routes, total } = await this.routeRepository.getAllRoutesWithStops(
        currentPage,
        limit
      );

      if (!routes || routes.length === 0) {
        return ServiceResponse.ok({
          data: [],
          meta: {
            total,
            totalPages: 0,
            page: currentPage,
            limit,
          },
        });
      }

      // ✅ Correct mapping
      const routeDTOs = AllRouteWithStopsDTO.fromRows(routes);

      const totalPages = Math.ceil(total / limit);

      await redis.set(
        cacheKey,
        JSON.stringify({
          data: routeDTOs,
          meta: {
            total,
            totalPages,
            page: currentPage,
            limit,
          },
        }),
        'EX',
        300
      );

      return ServiceResponse.ok({
        data: routeDTOs,
        meta: {
          total,
          totalPages,
          page: currentPage,
          limit,
        },
      });
    } catch (error) {
      console.error('Error fetching all routes', error);
      return ServiceResponse.internalError('An unexpected error occurred');
    }
  }

  async getRoute(id: number): Promise<ServiceResponse<RouteWithStopsDTO>> {
    const cacheKey = `trip-route:${id}`;
    try {
      const cachedRoutes = await redis.get(cacheKey);
      if (cachedRoutes) {
        console.log(`cached hit ${cacheKey}`);
        return ServiceResponse.ok(JSON.parse(cachedRoutes));
      }
      console.log('Cached miss');
      const route = await this.tripRepository.getRouteId(id);

      if (!route) {
        return ServiceResponse.badRequest('Trips not found');
      }
      console.log('route id', route.route_id);

      const rows = await this.routeRepository.getRouteWithStops(Number(route?.route_id));

      if (!rows || rows.length === 0) {
        return ServiceResponse.notFound('Route not found');
      }

      const routeDTO = RouteWithStopsDTO.fromRows(rows);

      if (!routeDTO) {
        return ServiceResponse.internalError('Failed to map route');
      }
      await redis.set(cacheKey, JSON.stringify(routeDTO), 'EX', 600);
      return ServiceResponse.ok(routeDTO);
    } catch (error) {
      console.error('error in fetching Route', error);
      return ServiceResponse.internalError('An unexpected error occured');
    }
  }
  async getRouteByRouteId(id: number): Promise<ServiceResponse<RouteWithStopsDTO>> {
    const cachedKey = `route:${id}`;
    try {
      const cached = await redis.get(cachedKey);
      if (cached) {
        console.log(`Cache HIT: route`);
        return ServiceResponse.ok(JSON.parse(cached));
      }
      console.log(`Cache HIT miss`);

      const rows = await this.routeRepository.getRouteWithStops(Number(id));

      if (!rows || rows.length === 0) {
        return ServiceResponse.notFound('Route not found');
      }

      const routeDTO = RouteWithStopsDTO.fromRows(rows);

      if (!routeDTO) {
        return ServiceResponse.internalError('Failed to map route');
      }
      await redis.set(cachedKey, JSON.stringify(routeDTO), 'EX', 600);
      return ServiceResponse.ok(routeDTO);
    } catch (error) {
      console.error('error in fetching Route', error);
      return ServiceResponse.internalError('An unexpected error occured');
    }
  }

  async createFullRoute(
    name: string,
    stops: any[],
    tripId?: number
  ): Promise<ServiceResponse<any>> {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');
      const route = await this.routeRepository.createRoute(name, client);
      if (!route) {
        await client.query('ROLLBACK');
        return ServiceResponse.databaseError('Failed to create route');
      }

      const orders = stops.map((s) => s.order);
      if (orders.length !== new Set(orders).size) {
        await client.query('ROLLBACK');
        return ServiceResponse.badRequest('Duplicate stop order');
      }

      await this.routeStopRepository.addRouteStops(route.id, stops, client);
      if (tripId) {
        const trip = await this.tripRepository.findById(tripId);
        if (!trip) {
          await client.query('ROLLBACK');
          return ServiceResponse.notFound('Trip not found');
        }
        await this.tripRepository.updateTripRoute(tripId, route.id, client);
      }
      await client.query('COMMIT');

      return ServiceResponse.ok({ routeId: route.id, linkedToTrip: !!tripId });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating full route:', error);
      return ServiceResponse.internalError('An unexpected error occurred');
    } finally {
      client.release();
    }
  }
}
