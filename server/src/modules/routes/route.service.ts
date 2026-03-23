import { ServiceResponse } from '@/shared/types';
import { RouteRepository } from './route.repository';
import { RouteDTO, RouteWithStopsDTO } from './route.dto';

export class RouteService {
  constructor(private routeRepository: RouteRepository) {}

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
    try {
      console.log('current page and limit', currentPage);
      const { routes, total } = await this.routeRepository.getAllRoutes(currentPage, limit);
      if (!routes || routes.length === 0) {
        ServiceResponse.ok({
          data: [],
          meta: {
            total,
            limit,
            page: currentPage,
            totalPages: 0,
          },
        });
      }

      const routeDTOs = RouteDTO.fromEntities(routes);
      const totalPages = Math.ceil(total / limit);
      return ServiceResponse.ok({
        data: routeDTOs,
        meta: {
          total: total,
          totalPages,
          page: currentPage,
          limit,
        },
      });
    } catch (error) {
      console.error('Error fetching all routes');
      return ServiceResponse.internalError('An unexpected error occured');
    }
  }

  async getRoute(id: number): Promise<ServiceResponse<any>> {
    try {
      const route = await this.routeRepository.getRouteById(id);
      if (!route) {
        return ServiceResponse.notFound('Route not found.');
      }
      const rows = await this.routeRepository.getRouteWithStops(id);

      if (!rows || rows.length === 0) {
        return ServiceResponse.notFound('Route not found');
      }
      console.log('rows are', rows);

      const routeDTO = RouteWithStopsDTO.fromRows(rows);

      if (!routeDTO) {
        return ServiceResponse.internalError('Failed to map route');
      }
      return ServiceResponse.ok(routeDTO);
    } catch (error) {
      console.error('error in fetching Route', error);
      return ServiceResponse.internalError('An unexpected error occured');
    }
  }
}
