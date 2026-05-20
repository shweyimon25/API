export class ReportCategoryResource {
  static toResource(reportCategory: any) {
    return {
      id: reportCategory.id,
      name: reportCategory.name,
      status: reportCategory.status,
      createdBy: reportCategory.createdBy,
      updatedBy: reportCategory.updatedBy,
      createdAt: reportCategory.createdAt,
      updatedAt: reportCategory.updatedAt,
    };
  }
}

