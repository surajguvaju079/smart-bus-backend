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

export interface RouteWithStopsRow {
  route_id: number;
  route_name: string;
  created_at: string;
  updated_at: string;

  stop_id: number | null;
  stop_name: string | null;
  latitude: number | null;
  longitude: number | null;
  stop_order: number | null;
}

export interface StopDTO {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface RouteWithStops {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stops: StopDTO[];
}

export class AllRouteWithStopsDTO {
  static fromRows(rows: RouteWithStopsRow[]): RouteWithStops[] {
    const map = new Map<number, RouteWithStops>();

    rows.forEach((row) => {
      // 🧱 Create route if not exists
      if (!map.has(row.route_id)) {
        map.set(row.route_id, {
          id: row.route_id,
          name: row.route_name,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          stops: [],
        });
      }

      // ➕ Add stop if exists
      if (row.stop_id) {
        map.get(row.route_id)!.stops.push({
          id: row.stop_id,
          name: row.stop_name!,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          order: row.stop_order!,
        });
      }
    });

    return Array.from(map.values());
  }
}
