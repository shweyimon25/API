export class TableTypeCollection {
  static toCollection(tableTypes: any[]) {
    return tableTypes.map((tableType: any) => ({
      id: tableType.id,
      name: tableType.name,
      createdAt: tableType.createdAt,
      updatedAt: tableType.updatedAt,
    }));
  }

  static withPagination(tableTypes: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(tableTypes.data),
      meta: tableTypes.meta,
    };
  }
}
