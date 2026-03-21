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
