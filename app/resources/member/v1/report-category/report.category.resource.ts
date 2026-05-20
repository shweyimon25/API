export class ReportCategoryResource {
  static toResource(reportCategory: any) {
    return {
      id: reportCategory.id,
      name: reportCategory.name
    };
  }
}
