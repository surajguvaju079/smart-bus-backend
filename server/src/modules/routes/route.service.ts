import { ServiceResponse } from '@/shared/types';
import { RouteRepository } from './route.repository';
import { RouteDTO } from './route.dto';

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
}
