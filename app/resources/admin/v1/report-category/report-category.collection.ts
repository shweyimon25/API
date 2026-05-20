import { ReportCategoryResource } from "./report-category.resource";

export class ReportCategoryCollection {
  static toCollection(reportCategorys: any[]) {
    return reportCategorys.map((reportCategory) => ReportCategoryResource.toResource(reportCategory));
  }

  static toCommonCollection(reportCategorys: any[]) {
    return reportCategorys.map((reportCategory) => ({
      id: reportCategory.id,
      name: reportCategory.name,
    }));
  }

  static withPagination(reportCategorys: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(reportCategorys.data),
      meta: reportCategorys.meta,
    };
  }
}

