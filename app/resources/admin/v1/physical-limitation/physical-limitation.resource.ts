export class PhysicalLimitationResource {
  static toResource(physicalLimitation: any) {
    return {
      id: physicalLimitation.id,
      name: physicalLimitation.name,
      photo: physicalLimitation.photo,
      description: physicalLimitation.description,
      status: physicalLimitation.status,
      createdBy: physicalLimitation.createdBy
        ? {
            id: physicalLimitation.createdBy.id,
            name: physicalLimitation.createdBy.name,
            email: physicalLimitation.createdBy.email,
            username: physicalLimitation.createdBy.username,
          }
        : null,
      updatedBy: physicalLimitation.updatedBy
        ? {
            id: physicalLimitation.updatedBy.id,
            name: physicalLimitation.updatedBy.name,
            email: physicalLimitation.updatedBy.email,
            username: physicalLimitation.updatedBy.username,
          }
        : null,
      createdAt: physicalLimitation.createdAt,
      updatedAt: physicalLimitation.updatedAt,
    };
  }
}

