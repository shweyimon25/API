export class CustomerCollection {
  static toCollection(customers: any[]) {
    return customers.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      balance: customer.balance,
      profile: customer.profile,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
  }

  static withPagination(customers: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(customers.data),
      meta: customers.meta,
    };
  }
}
