export class CustomerResource {
  static toResource(customer: any) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      balance: customer.balance,
      profile: customer.profile,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
