import { CategoryResource } from "./category.resource";

export class CategoryCollection {
  static toCollection(categories: any[]) {
    return categories.map((category) => CategoryResource.toResource(category));
  }

  static toCommonCollection(categories: any[]) {
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }

  static withPagination(categories: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(categories.data),
      meta: categories.meta,
    };
  }
}

