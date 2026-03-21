export interface RouteStopEntity {
  id: number;
  routeId: number;
  latitude: number;
  longitude: number;
  stopOrder: number;
}

export class RouteStopDto {
  public readonly id: number;
  public readonly routeId: number;
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly stopOrder: number;

  constructor(routeStop: RouteStopEntity) {
    this.id = routeStop.id;
    this.routeId = routeStop.routeId;
    this.latitude = routeStop.latitude;
    this.longitude = routeStop.longitude;
    this.stopOrder = routeStop.stopOrder;

    Object.freeze(this);
  }
  public static fromEntity(routeStop: RouteStopEntity): RouteStopDto {
    return new RouteStopDto(routeStop);
  }
  public static fromEntities(routeStops: RouteStopEntity[]): RouteStopDto[] {
    return routeStops.map((routeStop) => new RouteStopDto(routeStop));
  }
}
