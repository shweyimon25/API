export class BankInformationResource {
  static toResource(bankInformation: any) {
    return {
      id: bankInformation.id,
      coverPhoto: bankInformation.coverPhoto,
      bankAccountHolder: bankInformation.bankAccountHolder,
      bankAccountNumber: bankInformation.bankAccountNumber,
      phone: bankInformation.phone,
      paymentTypes: bankInformation.paymentTypes,
      status: bankInformation.status,
      createdBy: bankInformation.createdBy
        ? {
            id: bankInformation.createdBy.id,
            name: bankInformation.createdBy.name,
            email: bankInformation.createdBy.email,
            username: bankInformation.createdBy.username,
          }
        : null,
      updatedBy: bankInformation.updatedBy
        ? {
            id: bankInformation.updatedBy.id,
            name: bankInformation.updatedBy.name,
            email: bankInformation.updatedBy.email,
            username: bankInformation.updatedBy.username,
          }
        : null,
      createdAt: bankInformation.createdAt,
      updatedAt: bankInformation.updatedAt,
    };
  }
}
