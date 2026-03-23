export interface RouteEntity {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export class RouteDTO {
  public readonly id: number;
  public readonly name: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  private constructor(route: RouteEntity) {
    this.id = route.id;
    this.name = route.name;
    this.createdAt = new Date(route.created_at).toISOString();
    this.updatedAt = new Date(route.updated_at).toISOString();

    Object.freeze(this);
  }

  static fromEntity(route: RouteEntity | null): RouteDTO | null {
    if (!route) return null;
    return new RouteDTO(route);
  }

  static fromEntities(routes: RouteEntity[]): RouteDTO[] {
    return routes.map((route) => new RouteDTO(route));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

type Stop = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
};

export class RouteWithStopsDTO {
  public readonly id: number;
  public readonly name: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly stops: Stop[];

  private constructor(data: any[]) {
    const first = data[0];

    this.id = first.route_id;
    this.name = first.route_name;
    this.createdAt = new Date(first.created_at).toISOString();
    this.updatedAt = new Date(first.updated_at).toISOString();

    this.stops = data
      .filter((row) => row.stop_id !== null)
      .map((row) => ({
        id: row.stop_id,
        name: row.stop_name,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        order: row.stop_order,
      }));
  }

  static fromRows(rows: any[]): RouteWithStopsDTO | null {
    if (!rows || rows.length === 0) return null;
    return new RouteWithStopsDTO(rows);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      stops: this.stops,
    };
  }
}
