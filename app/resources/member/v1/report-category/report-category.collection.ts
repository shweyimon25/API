import { ReportCategoryResource } from "./report.category.resource";

export class ReportCategoryCollection {
  static toCollection(reportCategory: any[]) {
    return reportCategory.map((reportCategory) =>
      ReportCategoryResource.toResource(reportCategory)
    );
  }

  static toCommonCollection(reportCategory: any[]) {
    return reportCategory.map((reportCategory) => ({
      id: reportCategory.id,
      name: reportCategory.name
    }));
  }

  static withPagination(reportCategory: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(reportCategory.data),
      meta: reportCategory.meta,
    };
  }
}
