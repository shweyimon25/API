export class PhysicalLimitationResource {
  static toResource(physicalLimitation: any) {
    return {
      id: physicalLimitation.id,
      name: physicalLimitation.name,
      photo: physicalLimitation.photo,
      description: physicalLimitation.description,
      status: physicalLimitation.status,
      createdBy: physicalLimitation.createdBy,
      updatedBy: physicalLimitation.updatedBy,
      createdAt: physicalLimitation.createdAt,
      updatedAt: physicalLimitation.updatedAt,
    };
  }
}

